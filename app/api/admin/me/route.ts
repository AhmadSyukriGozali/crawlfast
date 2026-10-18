import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET(request: Request) {
  const result = await requireAdmin(request);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    authenticated: true,
    role: "admin",
    email: result.user.email,
  });
}
