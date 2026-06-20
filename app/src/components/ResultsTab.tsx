"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useVibeGoal } from "../hooks/useVibeGoal";

export default function ResultsTab() {
  const { connected } = useWallet();
  const { fetchPrediction, checkPrediction } = useVibeGoal();

  const [matchId, setMatchId] = useState("1");
  const [matchAccount, setMatchAccount] = useState("");
  const [prediction, setPrediction] = useState<any>(null);
  const [status, setStatus] = useState<{ type: "success" | "error" | "loading"; msg: string } | null>(null);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    setPrediction(null);
    setStatus({ type: "loading", msg: "Fetching your prediction..." });
    try {
      const id = parseInt(matchId);
      const pred = await fetchPrediction(id);
      console.log("fetchPrediction result:", pred);
      if (!pred) {
        setStatus({ type: "error", msg: `No prediction found for Match #${id} from your wallet.` });
      } else {
        setPrediction({ ...pred, _account: matchAccount, _matchId: id });
        setStatus(null);
      }
    } catch (e: any) {
      setStatus({ type: "error", msg: e?.message || "Failed to fetch" });
    }
  }

  async function handleVerify() {
    if (!prediction?._account) {
      setStatus({ type: "error", msg: "Match account address is required." });
      return;
    }
    setStatus({ type: "loading", msg: "Verifying prediction on-chain..." });
    try {
      await checkPrediction(prediction._matchId, prediction._account);
      const pred = await fetchPrediction(prediction._matchId);
      setPrediction({ ...pred, _account: prediction._account, _matchId: prediction._matchId });
      setStatus({ type: "success", msg: "Verified on-chain!" });
    } catch (e: any) {
      setStatus({ type: "error", msg: e?.message || "Verification failed — has the admin set the result yet?" });
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
        <h2>🔍 Check My Prediction</h2>
        <form onSubmit={handleFetch}>
          <label>Match ID</label>
          <input
            className="input"
            type="number"
            value={matchId}
            onChange={e => setMatchId(e.target.value)}
            required
          />
          <label>Match Account Address</label>
          <input
            className="input"
            type="text"
            placeholder="Paste match account address e.g. 4FBeqYcD..."
            value={matchAccount}
            onChange={e => setMatchAccount(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
            Fetch My Prediction
          </button>
        </form>

        {status && (
          <div className={`status-msg ${status.type}`} style={{ marginTop: "0.75rem" }}>
            {status.type === "loading" && "⏳ "}
            {status.type === "success" && "✅ "}
            {status.type === "error" && "❌ "}
            {status.msg}
          </div>
        )}
      </div>

      {prediction && (
        <div className="card">
          <h2>🏆 Your Prediction</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Match ID</span>
              <strong>#{prediction._matchId}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Your Prediction</span>
              <strong style={{ fontSize: "1.4rem", color: "var(--accent)" }}>
                {prediction.homePred} — {prediction.awayPred}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--muted)" }}>Verdict</span>
              {prediction.isCorrect
                ? <span className="badge badge-green" style={{ fontSize: "1rem", padding: "0.4rem 1rem" }}>🎉 Correct!</span>
                : <span className="badge badge-yellow" style={{ fontSize: "1rem", padding: "0.4rem 1rem" }}>⏳ Not verified yet</span>
              }
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>On-chain PDA</span>
              <a
                href={`https://explorer.solana.com/address/${prediction.pda}?cluster=custom&customUrl=http://127.0.0.1:8899`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "0.8rem" }}
              >
                {prediction.pda?.slice(0, 16)}... ↗
              </a>
            </div>
          </div>

          {!prediction.isCorrect && (
            <button
              className="btn btn-secondary"
              style={{ width: "100%", marginTop: "1.25rem" }}
              onClick={handleVerify}
            >
              Verify Result On-Chain
            </button>
          )}

          {prediction.isCorrect && (
            <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "2.5rem" }}>🎉🏆🎉</div>
          )}
        </div>
      )}
    </div>
  );
}
