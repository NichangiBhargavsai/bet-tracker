import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Bet from "@/models/Bet";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const betId = String(body.betId || "").trim();
    const userName = String(body.userName || "").trim();

    if (!betId || !userName) {
      return NextResponse.json({ error: "betId and userName are required." }, { status: 400 });
    }

    await connectToDatabase();
    const bet = await Bet.findById(betId);

    if (!bet) {
      return NextResponse.json({ error: "Bet not found." }, { status: 404 });
    }

    if (bet.personA === userName) {
      bet.acceptedA = true;
    } else if (bet.personB === userName) {
      bet.acceptedB = true;
    } else {
      return NextResponse.json({ error: "You must be person A or person B to accept this bet." }, { status: 403 });
    }

    await bet.save();
    return NextResponse.json({ bet });
  } catch (error) {
    return NextResponse.json({ error: "Unable to update bet status." }, { status: 500 });
  }
}
