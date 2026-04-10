import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const password = String(body.password || "");

    if (!name || !password) {
      return NextResponse.json({ error: "Please enter both username and password." }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ name });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const storedPassword = user.password;
    const passwordMatches =
      storedPassword.startsWith("$2")
        ? await bcrypt.compare(password, storedPassword)
        : storedPassword === password;

    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    if (!storedPassword.startsWith("$2")) {
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    return NextResponse.json({ user: { id: user._id.toString(), name: user.name } });
  } catch (error) {
    return NextResponse.json(
      { error: "Login failed. Please try again or check your server logs." },
      { status: 500 }
    );
  }
}
