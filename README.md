# Sidecar Indexer

Indexes `AssertionAdded` and `AssertionRemoved` events from the StateOracle contract using [Subsquid SDK](https://docs.sqd.ai/) and stores them in PostgreSQL.

## Prerequisites

- Node.js >= 22.14.0
- pnpm
- Docker (for PostgreSQL)

## Setup

```bash
pnpm install
cp infra/local/.env.example .env
# Edit .env with your RPC endpoint and contract address
```

## Run

```bash
# Start PostgreSQL
docker compose -f infra/local/docker-compose.yaml up -d

# Build (generates typed ABI decoders + TypeORM models, then compiles)
pnpm run build

# Apply database migrations
pnpm run migration:apply

# Start the indexer
pnpm run start
```

## Scripts

| Script | Description |
|---|---|
| `build` | Generate code + compile TypeScript |
| `start` | Run the indexer |
| `typegen` | Regenerate typed ABI decoders from `abi/StateOracle.json` into `src/abi/` |
| `codegen` | Regenerate TypeORM models from `schema.graphql` into `src/model/` |
| `migration:generate` | Generate a new DB migration from model changes |
| `migration:apply` | Apply pending migrations |
| `migration:reset` | Drop all migrations, rebuild, and regenerate from scratch |

## Project Structure

```
abi/StateOracle.json     # Source ABI (input for typegen)
schema.graphql           # Entity definitions (input for codegen)
src/
  main.ts                # Entry point: batch handler that decodes and stores events
  processor.ts           # Subsquid EvmBatchProcessor configuration
  abi/                   # Generated typed event decoders (gitignored)
  model/                 # Generated TypeORM entities (gitignored)
db/migrations/           # Database migrations
infra/local/
  docker-compose.yaml    # Local PostgreSQL
  .env.example           # Environment variable reference
```

## Environment Variables

See [`infra/local/.env.example`](infra/local/.env.example) for all available variables.

| Variable | Required | Description |
|---|---|---|
| `RPC_ENDPOINT` | Yes | Ethereum-compatible RPC URL (http/https/ws/wss) |
| `STATE_ORACLE_ADDRESS` | Yes | StateOracle contract address |
| `STATE_ORACLE_DEPLOYMENT_BLOCK` | No | Block to start indexing from (default: 0) |
| `FINALITY_CONFIRMATION` | No | Reorg safety depth in blocks (default: 64) |
| `SQD_GATEWAY` | No | Subsquid Network gateway for faster historical sync |
| `DB_*` | No | PostgreSQL connection (defaults match docker-compose) |
