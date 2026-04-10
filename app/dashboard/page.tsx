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
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/80 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-500">Bet Tracker</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Logged in as <span className="font-semibold text-slate-900">{user?.name}</span>.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/create-bet" className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
              Create a new bet
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
              <li className="rounded-2xl bg-slate-50 p-4">Create a bet, then both users accept it to confirm the bet.</li>
              <li className="rounded-2xl bg-slate-50 p-4">Pending bets are yellow. Confirmed bets are green. Completed bets are blue.</li>
              <li className="rounded-2xl bg-slate-50 p-4">Use the create bet button to add a new bet card.</li>
            </ul>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">All bets</h2>
              <p className="mt-1 text-sm text-slate-600">See every bet and accept the ones you are part of.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{bets.length} total bets</span>
          </div>

          {error ? <p className="rounded-2xl bg-rose-100 p-4 text-sm text-rose-900">{error}</p> : null}

          {loading ? (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">Loading bets...</div>
          ) : bets.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">No bets found. Create the first bet to get started.</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {bets.map((bet) => {
                const status = betStatus(bet);
                const userIsPersonA = bet.personA === user?.name;
                const userIsPersonB = bet.personB === user?.name;
                const hasAccepted = (userIsPersonA && bet.acceptedA) || (userIsPersonB && bet.acceptedB);
                const canAccept = (userIsPersonA || userIsPersonB) && !hasAccepted;

                return (
                  <article key={bet._id} className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{bet.description}</p>
                        <p className="mt-1 text-sm text-slate-500">Loser task: {bet.loserTask}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status.color}`}>{status.label}</span>
                    </div>

                    <div className="mt-6 space-y-3 text-sm text-slate-600">
                      <p><span className="font-semibold text-slate-900">Person A:</span> {bet.personA}</p>
                      <p><span className="font-semibold text-slate-900">Person B:</span> {bet.personB}</p>
                      <p><span className="font-semibold text-slate-900">Date:</span> {new Date(bet.dateTime).toLocaleString()}</p>
                      {bet.imageUrl ? (
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                          <img src={bet.imageUrl} alt="Bet proof" className="h-48 w-full object-cover" />
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        {bet.acceptedA ? "Person A accepted" : "Person A has not accepted"}
                        <br />
                        {bet.acceptedB ? "Person B accepted" : "Person B has not accepted"}
                      </div>
                      {canAccept ? (
                        <button
                          onClick={() => handleAccept(bet._id, user?.name ?? "")}
                          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Accept this bet
                        </button>
                      ) : null}
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
