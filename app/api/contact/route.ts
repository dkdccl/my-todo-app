import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

// お問い合わせフォームの送信先。
// Vercel などの環境変数 CONTACT_TO_EMAIL で上書きでき、未設定なら既定値を使う。
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "dkdccl@gmail.com";

// 送信元アドレス。独自ドメインを Resend で検証したらそのアドレスに変える。
// 未設定時は Resend のテスト用ドメイン onboarding@resend.dev を使う
// （テストモードでは Resend アカウント所有者宛にのみ送信できる）。
const FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL ?? "お問い合わせ <onboarding@resend.dev>";

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
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    // 返信するとフォーム入力者へ届くようにする。
    replyTo: email,
    subject: `【お問い合わせ】${name} さんより`,
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
