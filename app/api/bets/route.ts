import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Bet from "@/models/Bet";

const ALLOWED_USERS = ["homeboy", "homegurl"];

function getOpponent(name: string) {
  return name === "homeboy" ? "homegurl" : "homeboy";
}

export async function GET() {
  try {
    await connectToDatabase();
    const bets = await Bet.find().sort({ dateTime: -1 }).lean();
    return NextResponse.json({ bets });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load bets. Please try again." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const creatorName = String(body.creatorName || "").trim();
    const description = String(body.description || "").trim();
    const loserTask = String(body.loserTask || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    const dateTime = new Date(body.dateTime);

    if (!ALLOWED_USERS.includes(creatorName)) {
      return NextResponse.json({ error: "Invalid creator user." }, { status: 400 });
    }

    if (!description || !loserTask || Number.isNaN(dateTime.getTime())) {
      return NextResponse.json(
        { error: "All fields except image proof are required." },
        { status: 400 }
      );
    }

    const personA = creatorName;
    const personB = getOpponent(creatorName);

    await connectToDatabase();
    const bet = await Bet.create({
      personA,
      personB,
      description,
      loserTask,
      dateTime,
      imageUrl,
      acceptedA: true,
      acceptedB: false,
    });

    return NextResponse.json({ bet });
  } catch (error) {
    return NextResponse.json({ error: "Unable to create bet. Please try again." }, { status: 500 });
  }
}
