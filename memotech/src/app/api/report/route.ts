// app/api/report/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { type, message, page } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const typeLabels: Record<string, string> = {
      bug: "🐛 Bug Report",
      feedback: "💡 Feedback",
      other: "💬 Other",
    };

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "reports@memotech.app",
      to: process.env.REPORT_EMAIL ?? "damir@memotech.app",
      subject: `[Memo ${typeLabels[type] ?? "Report"}] from ${userId ?? "anonymous"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #c96acb; margin-bottom: 8px;">${typeLabels[type] ?? "Report"}</h2>
          <p style="color: #666; font-size: 13px; margin-bottom: 24px;">
            From: ${userId ?? "anonymous"} · Page: ${page ?? "unknown"}
          </p>
          <div style="background: #0b0b0b; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px;">
            <p style="color: #ccc; font-size: 14px; line-height: 1.7; white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[report]", err);
    // Return success anyway — don't surface email errors to user
    return NextResponse.json({ ok: true });
  }
}