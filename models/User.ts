import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  name: string;
  password?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  {
    timestamps: false,
  }
);

const User = models.User || model<IUser>("User", UserSchema);
export default User;
