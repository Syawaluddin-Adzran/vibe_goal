"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const PredictTab = dynamic(() => import("../components/PredictTab"), { ssr: false });
const AdminTab = dynamic(() => import("../components/AdminTab"), { ssr: false });
const ResultsTab = dynamic(() => import("../components/ResultsTab"), { ssr: false });

export default function Home() {
  const [tab, setTab] = useState<"predict" | "results" | "admin">("predict");

  return (
    <>
      <nav className="nav">
        <span className="nav-logo">⚽ VibeGoal</span>
        <WalletMultiButton />
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
          {" "}devnet &bull; Program:{" "}
          <a
            href="https://explorer.solana.com/address/9VfRKuNCy8mNHnWYq8N3C9a4sPaJ98szckyf3vVHRzGu?cluster=devnet"
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
