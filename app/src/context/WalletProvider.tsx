"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

require("@solana/wallet-adapter-react-ui/styles.css");

const DEVNET_RPC = "https://api.devnet.solana.com";

// Cast to any to avoid React 18.3 JSX type incompatibility with wallet-adapter
const Conn = ConnectionProvider as any;
const Wallet = WalletProvider as any;
const Modal = WalletModalProvider as any;

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <Conn endpoint={DEVNET_RPC}>
      <Wallet wallets={wallets} autoConnect>
        <Modal>{children}</Modal>
      </Wallet>
    </Conn>
  );
};
