import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

const DEFAULT_USERS = [
  { name: "homeboy", password: "myenemy23102024" },
  { name: "homegurl", password: "myenemy23102024" },
];

async function ensureDefaultUsers() {
  await connectToDatabase();

  for (const defaultUser of DEFAULT_USERS) {
    await User.findOneAndUpdate(
      { name: defaultUser.name },
      {
        name: defaultUser.name,
        password: await bcrypt.hash(defaultUser.password, 10),
      },
      { upsert: true, new: true }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !password) {
      return NextResponse.json({ error: "Please enter both username and password." }, { status: 400 });
    }

    const defaultUser = DEFAULT_USERS.find((user) => user.name === name);
    if (!defaultUser) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    await ensureDefaultUsers();

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
