import type { Metadata } from "next";
import { WalletContextProvider } from "../context/WalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeGoal — On-Chain Football Predictions",
  description: "Predict football match scores on Solana. No trust, no middleman.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
