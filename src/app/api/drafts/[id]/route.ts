import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateDraft } from "@/lib/drafts";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || !session.user.clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const post = await updateDraft(id, session.user.clientId, body);
    return NextResponse.json({ data: post });
  } catch {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }
}
