import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { generateDigestData } from "@/lib/digest";

// GET /api/digest/preview — returns the digest data as JSON so the UI can render a preview
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "you@example.com";
    const firstName = user?.firstName || "there";

    const digestData = await generateDigestData(userId, email, firstName);

    return NextResponse.json({ digest: digestData });
  } catch (err) {
    console.error("[GET /api/digest/preview]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to generate digest preview" }, { status: 500 });
  }
}