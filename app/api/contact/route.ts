import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

// お問い合わせフォームの送信先。
// Vercel などの環境変数 CONTACT_TO_EMAIL で上書きでき、未設定なら既定値を使う。
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "dkdccl@gmail.com";

// 送信元アドレス。独自ドメインを Resend で検証したらそのアドレスに変える。
// 未設定時は Resend のテスト用ドメイン onboarding@resend.dev を使う
// （テストモードでは Resend アカウント所有者宛にのみ送信できる）。
//
// 重要: 表示名は ASCII のみにする。From ヘッダーに非ASCII（日本語）を生の
// まま入れると、多くのメールクライアントがヘッダー全体を Latin-1 と誤認し、
// 件名・送信者名・本文まで文字化けする。日本語の差出人名を使いたい場合は
// 独自ドメインを検証したうえで MIME エンコードに対応した値を設定する。
const FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL ?? "Contact Form <onboarding@resend.dev>";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// 雑なメール形式チェック（厳密さより誤送信防止が目的）。
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// HTML メールに値を埋め込む前にエスケープ（タグ混入・崩れを防ぐ）。
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  // 1) ボディの取得とバリデーション
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "リクエスト本文が不正です。" },
      { status: 400 }
    );
  }

  const name = asTrimmedString(body.name);
  const email = asTrimmedString(body.email);
  const message = asTrimmedString(body.message);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "お名前・メールアドレス・お問い合わせ内容は必須です。" },
      { status: 400 }
    );
  }
  if (!looksLikeEmail(email)) {
    return NextResponse.json(
      { error: "メールアドレスの形式が正しくありません。" },
      { status: 400 }
    );
  }

  // 2) APIキーの確認（未設定なら 500 で明示）
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY が設定されていません。");
    return NextResponse.json(
      { error: "メール送信の設定が未完了です。管理者にお問い合わせください。" },
      { status: 500 }
    );
  }

  // 3) Resend で送信
  const resend = new Resend(apiKey);

  // 日本語の文字化け対策として、<meta charset="utf-8"> を持つ HTML メールを送る。
  // 一部メールクライアントはプレーンテキストの文字コードを誤判定して化けるため、
  // HTML を主とし、プレーンテキストはフォールバックとして併送する。
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  // メッセージ内の改行は HTML 上で <br> に変換して見た目を保つ。
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");

  const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:24px;font-family:'Hiragino Sans','Yu Gothic',Meiryo,sans-serif;color:#111;line-height:1.7;">
    <h2 style="margin:0 0 16px;font-size:18px;">お問い合わせがありました</h2>
    <p style="margin:0 0 8px;"><strong>お名前：</strong>${safeName}</p>
    <p style="margin:0 0 8px;"><strong>メールアドレス：</strong>${safeEmail}</p>
    <p style="margin:16px 0 4px;"><strong>お問い合わせ内容：</strong></p>
    <p style="margin:0;white-space:pre-wrap;">${safeMessage}</p>
  </body>
</html>`;

  const subject = `【お問い合わせ】${name} さんより`;

  // Resend に渡す直前の値をサーバーログに出力（文字化け調査用 / Vercel Logs で確認可）。
  console.log("[contact] from:", FROM_EMAIL);
  console.log("[contact] to:", TO_EMAIL);
  console.log("[contact] subject:", subject);
  console.log("[contact] html:", html);

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    // 返信するとフォーム入力者へ届くようにする。
    replyTo: email,
    subject,
    html,
    // プレーンテキスト版（HTML 非対応クライアント向けのフォールバック）。
    text: [
      `お名前: ${name}`,
      `メールアドレス: ${email}`,
      "",
      "お問い合わせ内容:",
      message,
    ].join("\n"),
  });

  if (error) {
    console.error("Resend send error:", error);
    return NextResponse.json(
      { error: "メール送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, id: data?.id ?? null });
}
