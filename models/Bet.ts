import mongoose, { Schema, model, models } from "mongoose";

export interface IBet {
  personA: string;
  personB: string;
  description: string;
  loserTask: string;
  dateTime: Date;
  imageUrl?: string;
  acceptedA: boolean;
  acceptedB: boolean;
  createdAt: Date;
}

const BetSchema = new Schema<IBet>(
  {
    personA: { type: String, required: true, trim: true },
    personB: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    loserTask: { type: String, required: true, trim: true },
    dateTime: { type: Date, required: true },
    imageUrl: { type: String, default: "" },
    acceptedA: { type: Boolean, default: false },
    acceptedB: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
  },
  {
    timestamps: false,
  }
);

const Bet = models.Bet || model<IBet>("Bet", BetSchema);
export default Bet;
