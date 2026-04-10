import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Please enter a name." }, { status: 400 });
    }

    await connectToDatabase();
    let user = await User.findOne({ name });

    if (!user) {
      user = await User.create({ name });
    }

    return NextResponse.json({ user: { id: user._id.toString(), name: user.name } });
  } catch (error) {
    return NextResponse.json(
      { error: "Login failed. Please try again or check your server logs." },
      { status: 500 }
    );
  }
}
