#!/bin/bash
set -e

NETWORK="${NETWORK:-testnet}"
SOURCE="${SOURCE:-deployer}"

# Load contract IDs from .env.local
ENV_FILE="$(dirname "$0")/../frontend/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ frontend/.env.local not found. Run deploy.sh first."
  exit 1
fi

source <(grep -v '^#' "$ENV_FILE" | sed 's/NEXT_PUBLIC_//' | sed 's/=/ /' | awk '{print "export "$1"="$2}')

VAULT_TOKEN_ID="$VAULT_TOKEN_CONTRACT_ID"
REVENUE_ROUTER_ID="$REVENUE_ROUTER_CONTRACT_ID"
SUB_MANAGER_ID="$SUBSCRIPTION_MANAGER_CONTRACT_ID"

ADMIN=$(stellar keys address "$SOURCE" --network "$NETWORK")
PAYMENT_TOKEN="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC" # XLM native asset wrapper on testnet

echo "🔧 Initializing VaultToken..."
stellar contract invoke \
  --id "$VAULT_TOKEN_ID" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$ADMIN" \
  --name "VaultToken" \
  --symbol "VAULT" \
  --decimals 7 \
  --minter "$SUB_MANAGER_ID"

echo ""
echo "🔧 Initializing RevenueRouter..."
# Default split: 70% creator (admin), 20% platform, 10% treasury
stellar contract invoke \
  --id "$REVENUE_ROUTER_ID" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$ADMIN" \
  --splits "[{\"0\":\"$ADMIN\",\"1\":7000},{\"0\":\"$ADMIN\",\"1\":2000},{\"0\":\"$ADMIN\",\"1\":1000}]" \
  --caller "$SUB_MANAGER_ID"

echo ""
echo "🔧 Initializing SubscriptionManager..."
stellar contract invoke \
  --id "$SUB_MANAGER_ID" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$ADMIN" \
  --vault_token "$VAULT_TOKEN_ID" \
  --revenue_router "$REVENUE_ROUTER_ID" \
  --payment_token "$PAYMENT_TOKEN" \
  --reward_rate 100

echo ""
echo "✅ All contracts initialized!"
echo ""
echo "🎯 Create your first tier:"
echo "   stellar contract invoke --id $SUB_MANAGER_ID --source $SOURCE --network $NETWORK -- create_tier --name \"Basic\" --price 10000000 --duration_ledgers 17280"
