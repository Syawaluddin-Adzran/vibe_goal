#!/bin/bash
# Full localnet setup: start validator, deploy program, airdrop SOL, create demo matches
set -e

PROGRAM_ID="9VfRKuNCy8mNHnWYq8N3C9a4sPaJ98szckyf3vVHRzGu"
RPC="http://127.0.0.1:8899"

echo "======================================"
echo " VibeGoal Localnet Setup"
echo "======================================"

# 1. Kill any existing validator
echo ""
echo "[1/5] Stopping any existing test validator..."
pkill -f solana-test-validator 2>/dev/null || true
sleep 1

# 2. Start fresh validator in background
echo "[2/5] Starting solana-test-validator..."
solana-test-validator --reset --quiet &
VALIDATOR_PID=$!
echo "  Validator PID: $VALIDATOR_PID"

# Wait for it to be ready
echo "  Waiting for validator to start..."
sleep 5
for i in {1..20}; do
  if solana cluster-version --url $RPC &>/dev/null; then
    echo "  ✅ Validator is ready!"
    break
  fi
  sleep 1
done

# 3. Configure CLI to use localnet
echo "[3/5] Configuring Solana CLI for localnet..."
solana config set --url $RPC

# 4. Airdrop SOL
echo "[4/5] Airdropping SOL to wallet..."
WALLET=$(solana address)
echo "  Wallet: $WALLET"
solana airdrop 10
echo "  Balance: $(solana balance)"

# 5. Deploy program
echo "[5/5] Deploying program to localnet..."
cd "$(dirname "$0")/.."

# Build if .so doesn't exist
if [ ! -f "target/deploy/vibe_goal.so" ]; then
  echo "  Building program..."
  anchor build
fi

# Deploy with the same program ID
anchor deploy --provider.cluster localnet

echo ""
echo "======================================"
echo " ✅ Localnet ready!"
echo " RPC:        $RPC"
echo " Program ID: $PROGRAM_ID"
echo " Wallet:     $WALLET"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. In a new terminal: cd app && npm install && npm run dev"
echo "  2. Open http://localhost:3000"
echo "  3. In Phantom: Settings > Developer Settings > Custom RPC > http://127.0.0.1:8899"
echo "  4. Use the Admin Panel tab to create matches"
echo "  5. Use Submit Prediction tab to predict"
echo ""
echo "To stop the validator later: kill $VALIDATOR_PID"
