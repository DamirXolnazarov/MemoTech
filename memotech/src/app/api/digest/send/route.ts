import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { generateDigestData } from "@/lib/digest";
import WeeklyDigestEmail from "@/emails/WeeklyDigestEmail";

// POST /api/digest/send — generate and email the weekly digest to the current user
export async function POST() {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("[digest/send] RESEND_API_KEY is undefined or empty");
      return NextResponse.json(
        { error: "Email sending is not configured (missing key)" },
        { status: 500 }
      );
    }

    console.log("[digest/send] Key present, length:", apiKey.length, "prefix:", apiKey.slice(0, 6));

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

    console.log("[digest/send] Generating digest data for", email);

    let digestData;
    try {
      digestData = await generateDigestData(userId, email, firstName);
    } catch (genErr) {
      console.error("[digest/send] generateDigestData failed:", genErr);
      return NextResponse.json(
        { error: "Failed to generate digest data", detail: genErr instanceof Error ? genErr.message : String(genErr) },
        { status: 500 }
      );
    }

    console.log("[digest/send] Digest data generated, sending email via Resend");

    const resend = new Resend(apiKey);

    let sendResult;
    try {
      sendResult = await resend.emails.send({
        from: "Memo <onboarding@resend.dev>",
        to: email,
        subject: `Your week in review: ${digestData.stats.sessionsRecorded} sessions, ${digestData.stats.hoursRecorded}h recorded`,
        react: WeeklyDigestEmail({ data: digestData }),
      });
    } catch (sendErr) {
      console.error("[digest/send] resend.emails.send threw:", sendErr);
      return NextResponse.json(
        { error: "Resend threw an exception", detail: sendErr instanceof Error ? sendErr.message : String(sendErr) },
        { status: 500 }
      );
    }

    if (sendResult.error) {
      console.error("[digest/send] Resend returned error:", sendResult.error);
      return NextResponse.json(
        { error: "Resend API error", detail: sendResult.error },
        { status: 500 }
      );
    }

    console.log("[digest/send] Email sent successfully, id:", sendResult.data?.id);

    return NextResponse.json({ success: true, emailId: sendResult.data?.id });
  } catch (err) {
    console.error("[digest/send] Unexpected top-level error:", err);
    return NextResponse.json(
      { error: "Failed to generate or send digest", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}