import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: userResult,
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !userResult?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = userResult.user.id;

  // Delete user-owned data first
  const { error: viewsError } = await supabaseAdmin
    .from("views")
    .delete()
    .eq("user_id", userId);

  if (viewsError) {
    console.error("Error deleting views for user", userId, viewsError);
    return NextResponse.json(
      { error: "Failed to delete views" },
      { status: 500 },
    );
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) {
    console.error("Error deleting profile for user", userId, profileError);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 },
    );
  }

  const { error: deleteUserError } =
    await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteUserError) {
    console.error("Error deleting auth user", userId, deleteUserError);
    return NextResponse.json(
      { error: "Failed to delete auth user" },
      { status: 500 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
