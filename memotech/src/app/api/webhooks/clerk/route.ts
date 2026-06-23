import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { Resend } from "resend";
import WelcomeEmail from "@/emails/WelcomeEmail";
import { seedWelcomeNotifications } from "@/lib/notifications";

interface ClerkUserCreatedEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ id: string; email_address: string }>;
    primary_email_address_id: string;
    first_name: string | null;
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[clerk webhook] CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(webhookSecret);
  let event: ClerkUserCreatedEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserCreatedEvent;
  } catch (err) {
    console.error("[clerk webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ received: true });
  }

  const { data } = event;
  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  )?.email_address;

  if (!primaryEmail) {
    console.error("[clerk webhook] No primary email found for new user", data.id);
    return NextResponse.json({ received: true });
  }

  // Send welcome email
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: primaryEmail,
      subject: "Welcome to Memo",
      react: WelcomeEmail({ firstName: data.first_name || "there" }),
    });
  } catch (err) {
    console.error("[clerk webhook] Failed to send welcome email:", err);
  }

  // Seed in-app notifications for this user
  try {
    await seedWelcomeNotifications(data.id, data.first_name || "");
  } catch (err) {
    console.error("[clerk webhook] Failed to seed notifications:", err);
  }

  return NextResponse.json({ received: true });
}