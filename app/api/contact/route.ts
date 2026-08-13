import { NextRequest, NextResponse } from "next/server";

const attempts = new Map<string, { count: number; reset: number }>();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.reset > now && entry.count >= 5) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  attempts.set(ip, !entry || entry.reset <= now ? { count: 1, reset: now + 10 * 60_000 } : { ...entry, count: entry.count + 1 });

  const body = await request.json().catch(() => null) as { name?: string; email?: string; message?: string; website?: string } | null;
  if (!body || body.website) return NextResponse.json({ ok: true });
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  if (name.length < 2 || name.length > 100 || !emailPattern.test(email) || message.length < 10 || message.length > 4000) return NextResponse.json({ error: "Invalid submission" }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: "Email delivery is not configured" }, { status: 503 });
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>", to: ["alphonseafanyu8@gmail.com"], reply_to: email, subject: `Portfolio enquiry from ${name}`, text: `Name: ${name}\nEmail: ${email}\n\n${message}` }) });
  if (!response.ok) return NextResponse.json({ error: "Delivery failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
