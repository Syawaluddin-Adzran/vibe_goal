"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useVibeGoal } from "../hooks/useVibeGoal";

export default function AdminTab() {
  const { connected, publicKey } = useWallet();
  const { createMatch, setResult, fetchMatch } = useVibeGoal();

  const [newMatchId, setNewMatchId] = useState("");
  const [createStatus, setCreateStatus] = useState<{ type: "success" | "error" | "loading"; msg: string } | null>(null);
  const [createdAccount, setCreatedAccount] = useState("");

  const [resultMatchAccount, setResultMatchAccount] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [resultStatus, setResultStatus] = useState<{ type: "success" | "error" | "loading"; msg: string } | null>(null);

  const [fetchAddress, setFetchAddress] = useState("");
  const [matchData, setMatchData] = useState<any>(null);
  const [fetchStatus, setFetchStatus] = useState<{ type: "success" | "error" | "loading"; msg: string } | null>(null);

  async function handleCreateMatch(e: React.FormEvent) {
    e.preventDefault();
    setCreateStatus({ type: "loading", msg: "Creating match on-chain..." });
    try {
      const acct = await createMatch(parseInt(newMatchId));
      setCreatedAccount(acct);
      setCreateStatus({ type: "success", msg: `Match created! Account: ${acct}` });
    } catch (e: any) {
      setCreateStatus({ type: "error", msg: e?.message || "Failed to create match" });
    }
  }

  async function handleSetResult(e: React.FormEvent) {
    e.preventDefault();
    setResultStatus({ type: "loading", msg: "Setting result on-chain..." });
    try {
      await setResult(resultMatchAccount, parseInt(homeScore), parseInt(awayScore));
      setResultStatus({ type: "success", msg: `Result set: ${homeScore} — ${awayScore}` });
    } catch (e: any) {
      setResultStatus({ type: "error", msg: e?.message || "Failed to set result" });
    }
  }

  async function handleFetchMatch(e: React.FormEvent) {
    e.preventDefault();
    setFetchStatus({ type: "loading", msg: "Fetching match..." });
    try {
      const data = await fetchMatch(fetchAddress);
      if (!data) {
        setFetchStatus({ type: "error", msg: "Match not found." });
        setMatchData(null);
      } else {
        setMatchData(data);
        setFetchStatus(null);
      }
    } catch (e: any) {
      setFetchStatus({ type: "error", msg: e?.message || "Failed to fetch" });
    }
  }

  if (!connected) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔌</div>
        <h2>Connect your wallet to access Admin Panel</h2>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>Only the match creator can set results</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ borderColor: "rgba(124,58,237,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <h2 style={{ margin: 0 }}>🛡️ Admin Panel</h2>
          <span className="badge badge-purple">Admin Only</span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          Connected as: {publicKey?.toBase58().slice(0, 20)}...
        </p>
      </div>

      {/* Create Match */}
      <div className="card">
        <h2>➕ Create Match</h2>
        <form onSubmit={handleCreateMatch}>
          <label>Match ID (unique number)</label>
          <input
            className="input"
            type="number"
            placeholder="e.g. 42"
            value={newMatchId}
            onChange={(e) => setNewMatchId(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">Create Match On-Chain</button>
        </form>
        {createStatus && (
          <div className={`status-msg ${createStatus.type}`}>
            {createStatus.type === "loading" && "⏳ "}
            {createStatus.type === "success" && "✅ "}
            {createStatus.type === "error" && "❌ "}
            {createStatus.msg}
          </div>
        )}
        {createdAccount && (
          <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--muted)" }}>
            Share this address with users so they can submit predictions:
            <br />
            <strong style={{ color: "var(--accent)", wordBreak: "break-all" }}>{createdAccount}</strong>
          </div>
        )}
      </div>

      {/* Set Result */}
      <div className="card">
        <h2>🏁 Set Match Result</h2>
        <form onSubmit={handleSetResult}>
          <label>Match Account Address</label>
          <input
            className="input"
            type="text"
            placeholder="Match account pubkey"
            value={resultMatchAccount}
            onChange={(e) => setResultMatchAccount(e.target.value)}
            required
          />
          <div className="input-row">
            <div style={{ flex: 1 }}>
              <label>Home Score</label>
              <input
                className="input"
                type="number"
                min={0}
                max={20}
                placeholder="0"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Away Score</label>
              <input
                className="input"
                type="number"
                min={0}
                max={20}
                placeholder="0"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                required
              />
            </div>
          </div>
          <button className="btn btn-secondary" type="submit">Set Result On-Chain</button>
        </form>
        {resultStatus && (
          <div className={`status-msg ${resultStatus.type}`}>
            {resultStatus.type === "loading" && "⏳ "}
            {resultStatus.type === "success" && "✅ "}
            {resultStatus.type === "error" && "❌ "}
            {resultStatus.msg}
          </div>
        )}
      </div>

      {/* Fetch Match State */}
      <div className="card">
        <h2>🔍 Inspect Match State</h2>
        <form onSubmit={handleFetchMatch}>
          <label>Match Account Address</label>
          <input
            className="input"
            type="text"
            placeholder="Match account pubkey"
            value={fetchAddress}
            onChange={(e) => setFetchAddress(e.target.value)}
            required
          />
          <button className="btn btn-ghost" type="submit">Fetch Match</button>
        </form>
        {fetchStatus && (
          <div className={`status-msg ${fetchStatus.type}`}>
            {fetchStatus.type === "loading" && "⏳ "}
            {fetchStatus.type === "success" && "✅ "}
            {fetchStatus.type === "error" && "❌ "}
            {fetchStatus.msg}
          </div>
        )}
        {matchData && (
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Match ID</span>
              <strong>#{matchData.matchId?.toString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Admin</span>
              <span style={{ fontSize: "0.8rem" }}>{matchData.admin?.toBase58().slice(0, 16)}...</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Score</span>
              <strong>
                {matchData.homeScore != null ? matchData.homeScore : "?"}{" "}
                —{" "}
                {matchData.awayScore != null ? matchData.awayScore : "?"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Status</span>
              {matchData.homeScore != null
                ? <span className="badge badge-green">Result Set</span>
                : <span className="badge badge-yellow">Awaiting Result</span>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
