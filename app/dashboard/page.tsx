"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Bet = {
  _id: string;
  personA: string;
  personB: string;
  description: string;
  loserTask: string;
  dateTime: string;
  imageUrl?: string;
  acceptedA: boolean;
  acceptedB: boolean;
};

type User = {
  id: string;
  name: string;
};

function betStatus(bet: Bet) {
  const now = new Date();
  const dateTime = new Date(bet.dateTime);

  if (!bet.acceptedA || !bet.acceptedB) {
    return { label: "Pending", color: "bg-amber-100 text-amber-900" };
  }

  if (dateTime < now) {
    return { label: "Completed", color: "bg-sky-100 text-sky-900" };
  }

  return { label: "Confirmed", color: "bg-emerald-100 text-emerald-900" };
}

export default function DashboardPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("bet-tracker-user");
    if (!stored) {
      router.replace("/");
      return;
    }

    setUser(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const loadBets = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/bets");
        const data = await response.json();

        if (!response.ok || data.error) {
          setError(data.error || "Unable to load bets.");
          setLoading(false);
          return;
        }

        setBets(data.bets || []);
      } catch (err) {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    loadBets();
  }, [user]);

  const confirmedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bets.forEach((bet) => {
      if (bet.acceptedA && bet.acceptedB) {
        counts[bet.personA] = (counts[bet.personA] || 0) + 1;
        counts[bet.personB] = (counts[bet.personB] || 0) + 1;
      }
    });
    return counts;
  }, [bets]);

  const visibleBets = useMemo(() => {
    if (filter === "mine" && user) {
      return bets.filter((bet) => bet.personA === user.name || bet.personB === user.name);
    }
    return bets;
  }, [bets, filter, user]);

  const handleAccept = async (betId: string, userName: string) => {
    setError("");
    try {
      const response = await fetch("/api/bets/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betId, userName }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setError(data.error || "Unable to accept bet.");
        return;
      }
      setBets((current) => current.map((bet) => (bet._id === data.bet._id ? data.bet : bet)));
    } catch (err) {
      setError("Unable to connect to the server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bet-tracker-user");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-white px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-500 p-8 text-white shadow-2xl shadow-sky-500/20 ring-1 ring-sky-200 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-sky-100">Bet Tracker</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your friendly bet dashboard</h1>
              <p className="mt-4 max-w-2xl text-sky-100/90">Only authenticated users can log in and accept bets. Both people must accept before a bet is confirmed.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/10 px-5 py-4 text-slate-100 shadow-lg shadow-slate-900/10 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-200">Logged in as</p>
                <p className="mt-2 text-xl font-semibold">{user?.name}</p>
              </div>
              <div className="rounded-3xl bg-white/10 px-5 py-4 text-slate-100 shadow-lg shadow-slate-900/10 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-200">Total bets</p>
                <p className="mt-2 text-xl font-semibold">{bets.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Active bets</h2>
            <p className="mt-2 text-sm text-slate-600">Only bet participants can accept a bet.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${filter === "all" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              All bets
            </button>
            <button
              type="button"
              onClick={() => setFilter("mine")}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${filter === "mine" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              My bets
            </button>
            <Link
              href="/create-bet"
              className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Create bet
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Confirmed bet count</h2>
            <p className="mt-2 text-sm text-slate-600">Only bets where both people accepted count here.</p>
            <div className="mt-4 space-y-3">
              {Object.keys(confirmedCounts).length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No confirmed bets yet.</p>
              ) : (
                Object.entries(confirmedCounts).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="font-medium text-slate-900">{name}</span>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Tips</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="rounded-2xl bg-slate-50 p-4">Create a bet, then the opponent accepts it to confirm the bet.</li>
              <li className="rounded-2xl bg-slate-50 p-4">Pending bets are yellow. Confirmed bets are green. Completed bets are blue.</li>
              <li className="rounded-2xl bg-slate-50 p-4">The creator automatically accepts when the bet is placed.</li>
            </ul>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">All bets</h2>
              <p className="mt-1 text-sm text-slate-600">See every bet and accept the ones you are part of.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{visibleBets.length} bets shown</span>
          </div>

          {error ? <p className="rounded-2xl bg-rose-100 p-4 text-sm text-rose-900">{error}</p> : null}

          {loading ? (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">Loading bets...</div>
          ) : visibleBets.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">No bets found. Create the first bet to get started.</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {visibleBets.map((bet) => {
                const status = betStatus(bet);
                const userIsPersonA = bet.personA === user?.name;
                const userIsPersonB = bet.personB === user?.name;
                const hasAccepted = (userIsPersonA && bet.acceptedA) || (userIsPersonB && bet.acceptedB);
                const canAccept = (userIsPersonA || userIsPersonB) && !hasAccepted;
                const waitingFor = userIsPersonA ? bet.personB : bet.personA;

                return (
                  <article key={bet._id} className="group rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-slate-300/80">
                    <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{bet.description}</p>
                        <p className="mt-1 text-sm text-slate-500">Loser task: {bet.loserTask}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status.color}`}>{status.label}</span>
                    </div>

                    <div className="mt-6 space-y-4 text-sm text-slate-600">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <p><span className="font-semibold text-slate-900">Person A:</span> {bet.personA}</p>
                        <p><span className="font-semibold text-slate-900">Person B:</span> {bet.personB}</p>
                      </div>
                      <p><span className="font-semibold text-slate-900">Date:</span> {new Date(bet.dateTime).toLocaleString()}</p>
                      {bet.imageUrl ? (
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                          <img src={bet.imageUrl} alt="Bet proof" className="h-48 w-full object-cover" />
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                      {canAccept ? (
                        <button
                          type="button"
                          onClick={() => handleAccept(bet._id, user?.name || "")}
                          className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Confirm this bet
                        </button>
                      ) : userIsPersonA || userIsPersonB ? (
                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                          {bet.acceptedA && bet.acceptedB
                            ? "This bet is confirmed."
                            : `Waiting for ${waitingFor} to confirm.`}
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Only participants can confirm this bet.</div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
