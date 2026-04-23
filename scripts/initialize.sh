#!/bin/bash
set -e

NETWORK="${NETWORK:-testnet}"
SOURCE="${SOURCE:-deployer}"

ENV_FILE="$(dirname "$0")/../frontend/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "frontend/.env.local not found. Run deploy.sh first."
  exit 1
fi

VAULT_TOKEN_ID=$(grep VAULT_TOKEN_CONTRACT_ID "$ENV_FILE" | cut -d= -f2)
REVENUE_ROUTER_ID=$(grep REVENUE_ROUTER_CONTRACT_ID "$ENV_FILE" | cut -d= -f2)
SUB_MANAGER_ID=$(grep SUBSCRIPTION_MANAGER_CONTRACT_ID "$ENV_FILE" | cut -d= -f2)
ADMIN=$(stellar keys address "$SOURCE")
PAYMENT_TOKEN="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"

echo "=== Initializing Contracts ==="
echo "Admin: $ADMIN"

echo "Initializing VaultToken..."
stellar contract invoke --id "$VAULT_TOKEN_ID" --source "$SOURCE" --network "$NETWORK" \
  -- initialize \
  --admin "$ADMIN" \
  --name "VaultToken" \
  --symbol "VAULT" \
  --decimals 7 \
  --minter "$SUB_MANAGER_ID"

echo "Initializing RevenueRouter..."
stellar contract invoke --id "$REVENUE_ROUTER_ID" --source "$SOURCE" --network "$NETWORK" \
  -- initialize \
  --admin "$ADMIN" \
  --splits "[[\"$ADMIN\",7000],[\"$ADMIN\",2000],[\"$ADMIN\",1000]]" \
  --caller "$SUB_MANAGER_ID"

echo "Initializing SubscriptionManager..."
stellar contract invoke --id "$SUB_MANAGER_ID" --source "$SOURCE" --network "$NETWORK" \
  -- initialize \
  --admin "$ADMIN" \
  --vault_token "$VAULT_TOKEN_ID" \
  --payment_token "$PAYMENT_TOKEN" \
  --reward_rate 100

echo ""
echo "All contracts initialized!"
echo ""
echo "Create your first tier:"
echo "  stellar contract invoke --id $SUB_MANAGER_ID --source $SOURCE --network $NETWORK \\"
echo "    -- create_tier --name \"Basic\" --price 100000000 --duration_ledgers 518400"
