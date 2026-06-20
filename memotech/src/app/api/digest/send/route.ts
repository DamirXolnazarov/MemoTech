import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { generateDigestData } from "@/lib/digest";
import WeeklyDigestEmail from "@/emails/WeeklyDigestEmail";

// POST /api/digest/send — generate and email the weekly digest to the current user
export async function POST() {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[POST /api/digest/send] RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email sending is not configured yet" },
        { status: 500 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    const firstName = user?.firstName || "there";

    if (!email) {
      return NextResponse.json({ error: "No email on file for this user" }, { status: 400 });
    }

    const digestData = await generateDigestData(userId, email, firstName);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "Memo <digest@memotech-ai.vercel.app>",
      to: email,
      subject: `Your week in review: ${digestData.stats.sessionsRecorded} sessions, ${digestData.stats.hoursRecorded}h recorded`,
      react: WeeklyDigestEmail({ data: digestData }),
    });

    if (error) {
      console.error("[POST /api/digest/send] Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (err) {
    console.error("[POST /api/digest/send]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to generate or send digest" }, { status: 500 });
  }
}