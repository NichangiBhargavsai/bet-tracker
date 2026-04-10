import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Bet from "@/models/Bet";

const ALLOWED_USERS = ["homeboy", "homegurl"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const betId = String(body.betId || "").trim();
    const userName = String(body.userName || "").trim();

    if (!betId || !userName) {
      return NextResponse.json({ error: "betId and userName are required." }, { status: 400 });
    }

    if (!ALLOWED_USERS.includes(userName)) {
      return NextResponse.json({ error: "Invalid user." }, { status: 401 });
    }

    await connectToDatabase();
    const bet = await Bet.findById(betId);

    if (!bet) {
      return NextResponse.json({ error: "Bet not found." }, { status: 404 });
    }

    if (bet.personA !== userName && bet.personB !== userName) {
      return NextResponse.json({ error: "You must be person A or person B to accept this bet." }, { status: 403 });
    }

    if (bet.personA === userName) {
      if (bet.acceptedA) {
        return NextResponse.json({ error: "You already accepted this bet." }, { status: 400 });
      }
      bet.acceptedA = true;
    } else {
      if (bet.acceptedB) {
        return NextResponse.json({ error: "You already accepted this bet." }, { status: 400 });
      }
      bet.acceptedB = true;
    }

    await bet.save();
    return NextResponse.json({ bet });
  } catch (error) {
    return NextResponse.json({ error: "Unable to update bet status." }, { status: 500 });
  }
}
