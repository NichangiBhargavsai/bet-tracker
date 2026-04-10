"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
};

export default function CreateBetPage() {
  const [personA, setPersonA] = useState("");
  const [personB, setPersonB] = useState("");
  const [description, setDescription] = useState("");
  const [loserTask, setLoserTask] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("bet-tracker-user");
    if (!stored) {
      router.replace("/");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!personA.trim() || !personB.trim() || !description.trim() || !loserTask.trim() || !dateTime) {
      setError("Please complete every required field before creating the bet.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personA, personB, description, loserTask, dateTime, imageUrl }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        setError(data.error || "Unable to create bet.");
        setLoading(false);
        return;
      }

      setSuccess("Bet created successfully! You can now accept it or let the other person accept.");
      setPersonA("");
      setPersonB("");
      setDescription("");
      setLoserTask("");
      setDateTime("");
      setImageUrl("");
      setLoading(false);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      setError("Unable to connect to the server.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/80 ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-sky-500">Create Bet</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">New friendly bet</h1>
              <p className="mt-2 text-slate-600">Enter both people, the challenge, and the date. Then both people can accept.</p>
            </div>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Back to dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/80 ring-1 ring-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Person A</span>
                <input
                  value={personA}
                  onChange={(event) => setPersonA(event.target.value)}
                  placeholder="Enter person A"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Person B</span>
                <input
                  value={personB}
                  onChange={(event) => setPersonB(event.target.value)}
                  placeholder="Enter person B"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Bet description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is the friendly bet about?"
                className="mt-2 min-h-[120px] w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Loser task</span>
              <input
                value={loserTask}
                onChange={(event) => setLoserTask(event.target.value)}
                placeholder="What does the loser need to do?"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            <div className="grid gap-6 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Date & time</span>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(event) => setDateTime(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Optional image URL</span>
                <input
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="Paste an image URL for proof"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>
            </div>

            {error ? <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-900">{error}</p> : null}
            {success ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-900">{success}</p> : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={loading}
            >
              {loading ? "Creating bet..." : "Create bet"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
