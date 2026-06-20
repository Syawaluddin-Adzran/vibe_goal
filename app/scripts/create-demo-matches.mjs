/**
 * Run this once to create demo matches on devnet.
 * Usage: node scripts/create-demo-matches.mjs <HELIUS_API_KEY>
 *
 * It will print the match account addresses — paste them into src/config/matches.ts
 */
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, BN, Wallet } from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const IDL = require("../src/idl/vibe_goal.json");

const PROGRAM_ID = new PublicKey("9VfRKuNCy8mNHnWYq8N3C9a4sPaJ98szckyf3vVHRzGu");

const apiKey = process.argv[2];
if (!apiKey) {
  console.error("Usage: node scripts/create-demo-matches.mjs <HELIUS_API_KEY>");
  process.exit(1);
}

const RPC = `https://devnet.helius-rpc.com/?api-key=${apiKey}`;

const DEMO_MATCHES = [
  { id: 1, home: "Manchester United", away: "Arsenal" },
  { id: 2, home: "Real Madrid", away: "Barcelona" },
  { id: 3, home: "Bayern Munich", away: "Dortmund" },
];

async function main() {
  // Load wallet from ~/.config/solana/id.json
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = JSON.parse(readFileSync(keypairPath, "utf-8"));
  const adminKeypair = Keypair.fromSecretKey(Buffer.from(secretKey));

  console.log("Admin wallet:", adminKeypair.publicKey.toBase58());

  const connection = new Connection(RPC, "confirmed");
  const balance = await connection.getBalance(adminKeypair.publicKey);
  console.log("Balance:", balance / 1e9, "SOL");

  if (balance < 0.05 * 1e9) {
    console.error("Insufficient balance. Need at least 0.05 SOL.");
    process.exit(1);
  }

  const wallet = new Wallet(adminKeypair);
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  const program = new Program(IDL, provider);

  const results = [];

  for (const match of DEMO_MATCHES) {
    const matchKeypair = Keypair.generate();
    console.log(`\nCreating match #${match.id}: ${match.home} vs ${match.away}`);

    try {
      const tx = await program.methods
        .createMatch(new BN(match.id))
        .accounts({
          matchAccount: matchKeypair.publicKey,
          admin: adminKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([matchKeypair])
        .rpc();

      console.log(`  ✅ Created! Account: ${matchKeypair.publicKey.toBase58()}`);
      console.log(`  TX: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
      results.push({ ...match, account: matchKeypair.publicKey.toBase58() });
    } catch (e) {
      console.error(`  ❌ Failed:`, e.message);
    }
  }

  console.log("\n\n========================================");
  console.log("PASTE THIS INTO src/config/matches.ts:");
  console.log("========================================\n");
  console.log(`export const DEMO_MATCHES = ${JSON.stringify(results, null, 2)};`);
  console.log(`\nexport const ADMIN_PUBKEY = "${adminKeypair.publicKey.toBase58()}";`);
}

main().catch(console.error);
