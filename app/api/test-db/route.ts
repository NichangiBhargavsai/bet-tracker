import connectToDatabase from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    return Response.json({ message: "MongoDB Connected ✅" });
  } catch (error) {
    return Response.json({ error: "Connection Failed ❌", details: String(error) });
  }
}
