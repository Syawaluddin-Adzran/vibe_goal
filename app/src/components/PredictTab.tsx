"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useVibeGoal } from "../hooks/useVibeGoal";
import { DEMO_MATCHES, DemoMatch } from "../config/matches";

export default function PredictTab() {
  const { connected } = useWallet();
  const { submitPrediction } = useVibeGoal();

  // Allow manually entered matches when DEMO_MATCHES is empty
  const [manualId, setManualId] = useState("1");
  const [manualHome, setManualHome] = useState("Team A");
  const [manualAway, setManualAway] = useState("Team B");
  const [manualAccount, setManualAccount] = useState("");

  const [selected, setSelected] = useState<DemoMatch | null>(
    DEMO_MATCHES.length > 0 ? DEMO_MATCHES[0] : null
  );
  const [home, setHome] = useState("0");
  const [away, setAway] = useState("0");
  const [status, setStatus] = useState<{ type: "success" | "error" | "loading"; msg: string } | null>(null);

  const useManual = DEMO_MATCHES.length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const matchId = useManual ? parseInt(manualId) : selected!.id;
    const matchAccount = useManual ? manualAccount : selected!.account;

    if (!matchAccount) {
      setStatus({ type: "error", msg: "Paste the Match Account Address from the Admin Panel." });
      return;
    }

    setStatus({ type: "loading", msg: "Submitting prediction on-chain..." });
    try {
      const pda = await submitPrediction(matchId, matchAccount, parseInt(home), parseInt(away));
      setStatus({ type: "success", msg: `✅ Prediction stored! PDA: ${pda.slice(0, 20)}...` });
    } catch (e: any) {
      setStatus({ type: "error", msg: e?.message || "Transaction failed" });
    }
  }

  if (!connected) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔌</div>
        <h2>Connect your wallet to submit a prediction</h2>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>Use Phantom or Solflare on Localhost</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hardcoded matches from config */}
      {DEMO_MATCHES.length > 0 && (
        <div className="card">
          <h2>⚽ Select a Match</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {DEMO_MATCHES.map((m) => (
              <div
                key={m.id}
                className="match-card"
                style={{ cursor: "pointer", borderColor: selected?.id === m.id ? "var(--accent)" : undefined }}
                onClick={() => { setSelected(m); setStatus(null); }}
              >
                <div className="match-header">
                  <span className="match-id">Match #{m.id}</span>
                  <span className="badge badge-purple">Open</span>
                </div>
                <div className="match-teams">
                  <div className="team"><div className="team-name">{m.home}</div></div>
                  <div className="vs">VS</div>
                  <div className="team"><div className="team-name">{m.away}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prediction form */}
      <div className="card">
        <h2>🎯 Submit Your Prediction</h2>

        {useManual && (
          <>
            <div style={{ padding: "0.75rem", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem", color: "var(--warning)" }}>
              💡 Paste the <strong>Match Account Address</strong> from the Admin Panel below.
            </div>

            <label>Match ID</label>
            <input className="input" type="number" value={manualId} onChange={e => setManualId(e.target.value)} />

            <label>Match Account Address (from Admin Panel)</label>
            <input
              className="input"
              type="text"
              placeholder="Paste address here e.g. 7xKXtg2CW87..."
              value={manualAccount}
              onChange={e => setManualAccount(e.target.value)}
            />
          </>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <div style={{ flex: 1 }}>
              <label>{useManual ? "Home" : selected?.home} Score</label>
              <input
                className="input"
                type="number"
                min={0}
                max={20}
                value={home}
                onChange={(e) => setHome(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>{useManual ? "Away" : selected?.away} Score</label>
              <input
                className="input"
                type="number"
                min={0}
                max={20}
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
          <div className={`status-msg ${status.type}`} style={{ marginTop: "0.75rem" }}>
            {status.type === "loading" && "⏳ "}
            {status.type === "error" && "❌ "}
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
}
