"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("bet-tracker-user");
    if (stored) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !password) {
      setError("Please enter both name and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Login failed. Try again.");
        setLoading(false);
        return;
      }

      localStorage.setItem("bet-tracker-user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (error) {
      setError("Unable to connect to the server. Check your network.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_-30px_rgba(14,116,144,0.35)] ring-1 ring-slate-200">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-500">Bet Tracker</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Friendly bet tracking for two people
          </h1>
          <p className="mt-4 text-slate-600">
            Log in using one of the two fixed users: <strong>homeboy</strong> or <strong>homegurl</strong> with password <strong>myenemy23102024</strong>. Both people must accept each bet before it becomes confirmed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Username</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="homeboy or homegurl"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </label>

          {error ? <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-900">{error}</p> : null}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in and continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
