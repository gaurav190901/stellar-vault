#!/bin/bash
set -e

NETWORK="${NETWORK:-testnet}"
SOURCE="${SOURCE:-deployer}"

echo "🚀 Building contracts..."
cargo build --target wasm32-unknown-unknown --release --manifest-path "$(dirname "$0")/../Cargo.toml"

WASM_DIR="$(dirname "$0")/../target/wasm32-unknown-unknown/release"

echo ""
echo "📦 Deploying VaultToken..."
VAULT_TOKEN_ID=$(stellar contract deploy \
  --wasm "$WASM_DIR/vault_token.wasm" \
  --source "$SOURCE" \
  --network "$NETWORK")
echo "VaultToken: $VAULT_TOKEN_ID"

echo ""
echo "📦 Deploying RevenueRouter..."
REVENUE_ROUTER_ID=$(stellar contract deploy \
  --wasm "$WASM_DIR/revenue_router.wasm" \
  --source "$SOURCE" \
  --network "$NETWORK")
echo "RevenueRouter: $REVENUE_ROUTER_ID"

echo ""
echo "📦 Deploying SubscriptionManager..."
SUB_MANAGER_ID=$(stellar contract deploy \
  --wasm "$WASM_DIR/subscription_manager.wasm" \
  --source "$SOURCE" \
  --network "$NETWORK")
echo "SubscriptionManager: $SUB_MANAGER_ID"

echo ""
echo "📝 Writing contract IDs to frontend/.env.local..."
FRONTEND_ENV="$(dirname "$0")/../frontend/.env.local"
cat > "$FRONTEND_ENV" <<EOF
NEXT_PUBLIC_NETWORK=$NETWORK
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC=https://soroban-testnet.stellar.org
NEXT_PUBLIC_VAULT_TOKEN_CONTRACT_ID=$VAULT_TOKEN_ID
NEXT_PUBLIC_REVENUE_ROUTER_CONTRACT_ID=$REVENUE_ROUTER_ID
NEXT_PUBLIC_SUBSCRIPTION_MANAGER_CONTRACT_ID=$SUB_MANAGER_ID
EOF

echo ""
echo "✅ All contracts deployed!"
echo "   VaultToken:           $VAULT_TOKEN_ID"
echo "   RevenueRouter:        $REVENUE_ROUTER_ID"
echo "   SubscriptionManager:  $SUB_MANAGER_ID"
echo ""
echo "Run: bash scripts/initialize.sh to initialize contracts"
