import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { currentPassword, newEmail, newPassword } = body;

  const user = await prisma.adminUser.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 }
    );
  }

  const updateData: { email?: string; passwordHash?: string } = {};

  if (newEmail && newEmail !== user.email) {
    updateData.email = newEmail;
  }

  if (newPassword) {
    updateData.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ message: "No changes to save" });
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: updateData,
  });

  return NextResponse.json({ message: "Settings updated successfully" });
}
