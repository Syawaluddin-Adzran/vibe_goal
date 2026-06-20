"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useVibeGoal } from "../hooks/useVibeGoal";

export default function PredictTab() {
  const { connected } = useWallet();
  const { submitPrediction } = useVibeGoal();

  const [matchId, setMatchId] = useState("");
  const [matchAccount, setMatchAccount] = useState("");
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | "loading"; msg: string } | null>(null);

  const DEMO_MATCHES = [
    { id: 1, home: "Manchester United", away: "Arsenal", account: "" },
    { id: 2, home: "Real Madrid", away: "Barcelona", account: "" },
    { id: 3, home: "Bayern Munich", away: "Dortmund", account: "" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!matchId || !matchAccount || home === "" || away === "") return;
    setStatus({ type: "loading", msg: "Submitting prediction on-chain..." });
    try {
      const pda = await submitPrediction(
        parseInt(matchId),
        matchAccount,
        parseInt(home),
        parseInt(away)
      );
      setStatus({ type: "success", msg: `Prediction stored! PDA: ${pda}` });
    } catch (e: any) {
      setStatus({ type: "error", msg: e?.message || "Transaction failed" });
    }
  }

  if (!connected) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔌</div>
        <h2>Connect your wallet to submit a prediction</h2>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>Use Phantom or Solflare on Solana devnet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>⚽ Active Matches</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Click a match to pre-fill the form below. You need a match account address from the admin.
        </p>
        <div className="grid-2">
          {DEMO_MATCHES.map((m) => (
            <div
              key={m.id}
              className="match-card"
              style={{ cursor: "pointer" }}
              onClick={() => setMatchId(String(m.id))}
            >
              <div className="match-header">
                <span className="match-id">Match #{m.id}</span>
                <span className="badge badge-purple">Accepting Predictions</span>
              </div>
              <div className="match-teams">
                <div className="team">
                  <div className="team-name">{m.home}</div>
                </div>
                <div className="vs">VS</div>
                <div className="team">
                  <div className="team-name">{m.away}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>🎯 Submit Your Prediction</h2>
        <form onSubmit={handleSubmit}>
          <label>Match ID</label>
          <input
            className="input"
            type="number"
            placeholder="e.g. 1"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            required
          />

          <label>Match Account Address (from admin)</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. 7xKXtg2CW87d..."
            value={matchAccount}
            onChange={(e) => setMatchAccount(e.target.value)}
            required
          />

          <div className="input-row">
            <div style={{ flex: 1 }}>
              <label>Home Score Prediction</label>
              <input
                className="input"
                type="number"
                min={0}
                max={20}
                placeholder="0"
                value={home}
                onChange={(e) => setHome(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Away Score Prediction</label>
              <input
                className="input"
                type="number"
                min={0}
                max={20}
                placeholder="0"
                value={away}
                onChange={(e) => setAway(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" style={{ width: "100%", padding: "0.75rem" }}>
            Submit Prediction On-Chain
          </button>
        </form>

        {status && (
          <div className={`status-msg ${status.type}`}>
            {status.type === "loading" && "⏳ "}
            {status.type === "success" && "✅ "}
            {status.type === "error" && "❌ "}
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
}
