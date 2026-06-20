// This file is auto-populated by scripts/create-demo-matches.mjs
// Re-run the script if you need to recreate matches on devnet.

export interface DemoMatch {
  id: number;
  home: string;
  away: string;
  account: string; // on-chain MatchAccount pubkey
}

// TODO: Run `node scripts/create-demo-matches.mjs <HELIUS_KEY>` and paste results here
export const DEMO_MATCHES: DemoMatch[] = [
  // Example (replace with real addresses after running script):
  // { id: 1, home: "Manchester United", away: "Arsenal", account: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" },
];

export const ADMIN_PUBKEY = "3Mkx4gZKM46ELWsCAKvk2wMzk78WpMWongRmLgX5nSLh";
