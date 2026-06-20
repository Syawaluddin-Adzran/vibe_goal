import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { useMemo } from "react";
import IDL from "../idl/vibe_goal.json";

const PROGRAM_ID = new PublicKey("9VfRKuNCy8mNHnWYq8N3C9a4sPaJ98szckyf3vVHRzGu");

export function useVibeGoal() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.publicKey) return null;
    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
    return new Program(IDL as any, provider);
  }, [connection, wallet]);

  async function createMatch(matchId: number) {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
    const matchKeypair = Keypair.generate();
    await program.methods
      .createMatch(new BN(matchId))
      .accounts({
        matchAccount: matchKeypair.publicKey,
        admin: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([matchKeypair])
      .rpc();
    return matchKeypair.publicKey.toBase58();
  }

  async function submitPrediction(
    matchId: number,
    matchAccountPubkey: string,
    homePred: number,
    awayPred: number
  ) {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
    const [predPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pred"),
        wallet.publicKey.toBuffer(),
        new BN(matchId).toArrayLike(Buffer, "le", 8),
      ],
      PROGRAM_ID
    );
    await program.methods
      .submitPrediction(new BN(matchId), homePred, awayPred)
      .accounts({
        prediction: predPda,
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    return predPda.toBase58();
  }

  async function setResult(
    matchAccountPubkey: string,
    homeScore: number,
    awayScore: number
  ) {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
    await program.methods
      .setResult(homeScore, awayScore)
      .accounts({
        matchAccount: new PublicKey(matchAccountPubkey),
        admin: wallet.publicKey,
      })
      .rpc();
  }

  async function checkPrediction(
    matchId: number,
    matchAccountPubkey: string,
    userPubkey?: string
  ) {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
    const targetUser = userPubkey
      ? new PublicKey(userPubkey)
      : wallet.publicKey;
    const [predPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pred"),
        targetUser.toBuffer(),
        new BN(matchId).toArrayLike(Buffer, "le", 8),
      ],
      PROGRAM_ID
    );
    await program.methods
      .checkPrediction()
      .accounts({
        matchAccount: new PublicKey(matchAccountPubkey),
        prediction: predPda,
      })
      .rpc();
  }

  async function fetchMatch(matchAccountPubkey: string) {
    if (!program) return null;
    try {
      const acc = await program.account["matchAccount"].fetch(
        new PublicKey(matchAccountPubkey)
      );
      return acc;
    } catch {
      return null;
    }
  }

  async function fetchPrediction(matchId: number, userPubkey?: string) {
    if (!program || !wallet.publicKey) return null;
    const targetUser = userPubkey
      ? new PublicKey(userPubkey)
      : wallet.publicKey;
    const [predPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pred"),
        targetUser.toBuffer(),
        new BN(matchId).toArrayLike(Buffer, "le", 8),
      ],
      PROGRAM_ID
    );
    try {
      const acc = await program.account["prediction"].fetch(predPda);
      return { ...acc, pda: predPda.toBase58() };
    } catch {
      return null;
    }
  }

  return {
    program,
    createMatch,
    submitPrediction,
    setResult,
    checkPrediction,
    fetchMatch,
    fetchPrediction,
    connected: !!wallet.publicKey,
    publicKey: wallet.publicKey,
  };
}
