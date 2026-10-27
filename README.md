# Sidecar Indexer

Indexes `AssertionAdded`, `AssertionRemoved`, and `StorageReset` events from the StateOracle contract using [Subsquid SDK](https://docs.sqd.ai/) and stores them in PostgreSQL.

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

## Run (Docker)

```bash
# Stop any previous instance and wipe volumes
docker compose -f infra/local/docker-compose.yaml down -v

# Build and start all services
docker compose -f infra/local/docker-compose.yaml up --build
```

Startup order (handled by docker-compose healthchecks):

1. **db** — PostgreSQL starts and becomes healthy (`pg_isready`)
2. **api** — Applies migrations, then starts the GraphQL server on port 4350. Healthy once the GraphQL endpoint responds.
3. **indexer** — Starts only after the API is healthy. Begins indexing events from the RPC endpoint.

Open http://localhost:4350/graphiql for the GraphiQL playground.

## Run (Manual)

```bash
# Start PostgreSQL only
docker compose -f infra/local/docker-compose.yaml up db -d

# Build (generates typed ABI decoders + TypeORM models, then compiles)
pnpm run build

# Apply database migrations
pnpm run migration:apply

# Start the indexer
pnpm run start

# In another terminal: start the GraphQL API server
pnpm run serve
```

## GraphQL Queries

**List all available query fields:**
```graphql
{
  __schema {
    queryType {
      fields { name }
    }
  }
}
```

**Fetch all AssertionAdded events:**
```graphql
{
  assertionAddeds {
    totalCount
    nodes {
      id
      block
      txHash
      logIndex
      assertionAdopter
      assertionId
      activationBlock
      daVerifier
      metadata
      proof
    }
  }
}
```

**Filter by assertion adopter:**
```graphql
{
  assertionAddeds(
    filter: {
      assertionAdopter: {
        equalTo: "0x7353086583b9e2bbf612f7cdb5d213106b4cfcb7"
      }
    }
  ) {
    totalCount
    nodes {
      id
      block
      logIndex
      assertionId
    }
  }
}
```

**Filter by assertion ID and adopter:**
```graphql
{
  assertionAddeds(
    filter: {
      assertionId: { equalTo: "0xabc..." }
      assertionAdopter: { equalTo: "0x123..." }
    }
  ) {
    nodes {
      block
      activationBlock
      logIndex
    }
  }
}
```

**Fetch AssertionRemoved events since a block:**
```graphql
{
  assertionRemoveds(
    filter: { block: { greaterThan: 100 } }
    orderBy: BLOCK_ASC
  ) {
    totalCount
    nodes {
      block
      assertionAdopter
      assertionId
      deactivationBlock
      logIndex
    }
  }
}
```

**Fetch StorageReset events since a block:**
```graphql
{
  storageResets(
    filter: { block: { greaterThan: 100 } }
    orderBy: BLOCK_ASC
  ) {
    totalCount
    nodes {
      block
      adopter
      storageKey
      resetBlock
      logIndex
    }
  }
}
```

## Scripts

| Script | Description |
|---|---|
| `build` | Generate code + compile TypeScript |
| `start` | Run the indexer |
| `serve` | Start the GraphQL API server (PostGraphile) |
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
  api.ts                 # PostGraphile GraphQL API server
  processor.ts           # Subsquid data source configuration (RPC + Portal fallback)
  config.ts              # Environment variable parsing and validation
  legacy-portal.ts       # Legacy gateway URL to Portal dataset translation
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
| `RPC_NETWORK` | No | Subsquid network preset or EVM chain identifier (default: `ethereum-mainnet`) |
| `STATE_ORACLE_ADDRESS` | Yes | StateOracle contract address |
| `STATE_ORACLE_DEPLOYMENT_BLOCK` | No | Block to start indexing from (default: 0) |
| `FINALITY_CONFIRMATION` | No | Fixed reorg-safety depth in blocks. When omitted, the indexer uses the RPC or Portal native finalized head. |
| `RPC_RATE_LIMIT` | No | RPC request rate limit in requests/second (default: 20) |
| `RPC_CAPACITY` | No | Maximum concurrent in-flight RPC requests (default: 10) |
| `RPC_STRIDE_SIZE` | No | Number of consecutive blocks scheduled in each historical ingestion job (default: 5). This is not the JSON-RPC batch-call size. |
| `RPC_STRIDE_CONCURRENCY` | No | Maximum historical ingestion jobs processed in parallel (default: 5). Increasing it can speed up catch-up while adding RPC and memory pressure; `RPC_CAPACITY` and `RPC_RATE_LIMIT` still bound the client. |
| `SQD_GATEWAY` | No | Subsquid v2 gateway or Portal dataset URL used for accelerated ingestion and RPC fallback |
| `SQD_API_KEY` | Conditional | Subsquid API key required when `SQD_GATEWAY` is configured |
| `GRAPHQL_SERVER_PORT` | No | Port for the GraphQL API server (default: 4350) |
| `DB_*` | No | PostgreSQL connection (defaults match docker-compose) |

Existing deployments that set `FINALITY_CONFIRMATION` continue to use that
confirmation depth. Unset it to use native finality.
