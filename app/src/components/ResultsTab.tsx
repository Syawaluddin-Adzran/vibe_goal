"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useVibeGoal } from "../hooks/useVibeGoal";

export default function ResultsTab() {
  const { connected, publicKey } = useWallet();
  const { fetchPrediction, checkPrediction } = useVibeGoal();

  const [matchId, setMatchId] = useState("");
  const [matchAccount, setMatchAccount] = useState("");
  const [prediction, setPrediction] = useState<any>(null);
  const [status, setStatus] = useState<{ type: "success" | "error" | "loading"; msg: string } | null>(null);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "loading", msg: "Fetching prediction..." });
    try {
      const pred = await fetchPrediction(parseInt(matchId));
      if (!pred) {
        setStatus({ type: "error", msg: "No prediction found for this match." });
        setPrediction(null);
      } else {
        setPrediction(pred);
        setStatus(null);
      }
    } catch (e: any) {
      setStatus({ type: "error", msg: e?.message || "Failed to fetch" });
    }
  }

  async function handleCheck() {
    if (!matchAccount) {
      setStatus({ type: "error", msg: "Enter the match account address to verify." });
      return;
    }
    setStatus({ type: "loading", msg: "Verifying prediction on-chain..." });
    try {
      await checkPrediction(parseInt(matchId), matchAccount);
      const pred = await fetchPrediction(parseInt(matchId));
      setPrediction(pred);
      setStatus({ type: "success", msg: "Prediction verified on-chain!" });
    } catch (e: any) {
      setStatus({ type: "error", msg: e?.message || "Verification failed" });
    }
  }

  if (!connected) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔌</div>
        <h2>Connect your wallet to view results</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>🔍 Look Up Your Prediction</h2>
        <form onSubmit={handleFetch}>
          <label>Match ID</label>
          <input
            className="input"
            type="number"
            placeholder="e.g. 1"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            required
          />
          <label>Match Account Address (to verify result)</label>
          <input
            className="input"
            type="text"
            placeholder="Optional — needed for on-chain verification"
            value={matchAccount}
            onChange={(e) => setMatchAccount(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Fetch Prediction
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

      {prediction && (
        <div className="card">
          <h2>📋 Your Prediction</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Match ID</span>
              <strong>#{prediction.matchId?.toString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Your Prediction</span>
              <strong style={{ fontSize: "1.3rem" }}>
                {prediction.homePred} — {prediction.awayPred}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--muted)" }}>Result</span>
              {prediction.isCorrect
                ? <span className="badge badge-green">✅ Correct!</span>
                : <span className="badge badge-yellow">⏳ Pending or Incorrect</span>
              }
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>PDA</span>
              <a
                href={`https://explorer.solana.com/address/${prediction.pda}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "0.8rem" }}
              >
                {prediction.pda?.slice(0, 12)}...
              </a>
            </div>
          </div>

          {!prediction.isCorrect && matchAccount && (
            <button
              className="btn btn-secondary"
              style={{ width: "100%", marginTop: "1rem" }}
              onClick={handleCheck}
            >
              Verify Result On-Chain
            </button>
          )}
        </div>
      )}
    </div>
  );
}
