import { NextRequest, NextResponse } from "next/server";
import { checkUserEmail } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  const user = await checkUserEmail(email);

  if (user) {
    return NextResponse.json({ userId: user.id });
  } else {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
