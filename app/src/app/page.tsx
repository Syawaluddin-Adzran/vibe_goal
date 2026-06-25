"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const PredictTab = dynamic(() => import("../components/PredictTab"), { ssr: false });
const AdminTab = dynamic(() => import("../components/AdminTab"), { ssr: false });
const ResultsTab = dynamic(() => import("../components/ResultsTab"), { ssr: false });

function AutoAirdrop() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [msg, setMsg] = useState("");
  const airdropped = useRef<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    const key = publicKey.toBase58();
    if (airdropped.current === key) return; // already airdropped this session
    airdropped.current = key;

    (async () => {
      try {
        const sig = await connection.requestAirdrop(publicKey, 100 * LAMPORTS_PER_SOL);
        await connection.confirmTransaction(sig, "confirmed");
        setMsg("✅ 100 SOL airdropped!");
      } catch (e: any) {
        setMsg("Airdrop failed: " + (e?.message ?? e));
      }
      setTimeout(() => setMsg(""), 5000);
    })();
  }, [publicKey, connection]);

  if (!msg) return null;
  return (
    <span style={{ color: msg.startsWith("✅") ? "var(--accent)" : "var(--danger)", fontSize: "0.85rem" }}>
      {msg}
    </span>
  );
}

export default function Home() {
  const [tab, setTab] = useState<"predict" | "results" | "admin">("predict");

  return (
    <>
      <nav className="nav">
        <span className="nav-logo">⚽ VibeGoal</span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <AutoAirdrop />
          <WalletMultiButton />
        </div>
      </nav>

      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="hero">
          <h1>Predict. Win. On-Chain.</h1>
          <p>
            Submit your football score predictions on Solana devnet.
            Results are verified trustlessly on-chain — no backend, no middleman.
          </p>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "predict" ? "active" : ""}`} onClick={() => setTab("predict")}>
            Submit Prediction
          </button>
          <button className={`tab ${tab === "results" ? "active" : ""}`} onClick={() => setTab("results")}>
            My Results
          </button>
          <button className={`tab ${tab === "admin" ? "active" : ""}`} onClick={() => setTab("admin")}>
            Admin Panel
          </button>
        </div>

        {tab === "predict" && <PredictTab />}
        {tab === "results" && <ResultsTab />}
        {tab === "admin" && <AdminTab />}
      </main>

      <footer className="footer">
        <p>
          VibeGoal &mdash; Built on{" "}
          <a href="https://solana.com" target="_blank" rel="noreferrer">Solana</a>
          {" "}{process.env.NEXT_PUBLIC_CLUSTER || "localnet"} &bull; Program:{" "}
          <a
            href={`https://explorer.solana.com/address/9VfRKuNCy8mNHnWYq8N3C9a4sPaJ98szckyf3vVHRzGu?cluster=${process.env.NEXT_PUBLIC_CLUSTER || "custom&customUrl=http://127.0.0.1:8899"}`}
            target="_blank"
            rel="noreferrer"
          >
            9VfRKuN...zGu
          </a>
        </p>
      </footer>
    </>
  );
}
