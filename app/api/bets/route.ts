import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Bet from "@/models/Bet";

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
    const personA = String(body.personA || "").trim();
    const personB = String(body.personB || "").trim();
    const description = String(body.description || "").trim();
    const loserTask = String(body.loserTask || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    const dateTime = new Date(body.dateTime);

    if (!personA || !personB || !description || !loserTask || Number.isNaN(dateTime.getTime())) {
      return NextResponse.json(
        { error: "All fields except image proof are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const bet = await Bet.create({
      personA,
      personB,
      description,
      loserTask,
      dateTime,
      imageUrl,
      acceptedA: false,
      acceptedB: false,
    });

    return NextResponse.json({ bet });
  } catch (error) {
    return NextResponse.json({ error: "Unable to create bet. Please try again." }, { status: 500 });
  }
}
