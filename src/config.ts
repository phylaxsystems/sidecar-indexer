/**
 * Environment parsing, validated once at startup so a malformed value fails fast
 * instead of surfacing as NaN deep in the ingestion pipeline. An absent
 * FINALITY_CONFIRMATION selects native finality rather than a default depth.
 */

export interface IndexerConfig {
  rpcEndpoint: string;
  rpcNetwork: string | number;
  stateOracleAddress: string;
  stateOracleDeploymentBlock: number;
  finalityConfirmation?: number;
  rpcRateLimit: number;
  rpcCapacity: number;
  rpcStrideSize: number;
  rpcStrideConcurrency: number;
  sqdGateway?: string;
  sqdApiKey?: string;
}

export function loadConfig(
  env: NodeJS.ProcessEnv = process.env,
): IndexerConfig {
  return {
    rpcEndpoint: required(env, "RPC_ENDPOINT"),
    rpcNetwork: rpcNetwork(env.RPC_NETWORK),
    stateOracleAddress: required(env, "STATE_ORACLE_ADDRESS"),
    stateOracleDeploymentBlock: nonNegativeInteger(
      env.STATE_ORACLE_DEPLOYMENT_BLOCK ?? "0",
      "STATE_ORACLE_DEPLOYMENT_BLOCK",
    ),
    finalityConfirmation: optionalNonNegativeInteger(
      env.FINALITY_CONFIRMATION,
      "FINALITY_CONFIRMATION",
    ),
    rpcRateLimit: positiveInteger(env.RPC_RATE_LIMIT ?? "20", "RPC_RATE_LIMIT"),
    rpcCapacity: positiveInteger(env.RPC_CAPACITY ?? "10", "RPC_CAPACITY"),
    rpcStrideSize: positiveInteger(
      env.RPC_STRIDE_SIZE ?? "5",
      "RPC_STRIDE_SIZE",
    ),
    rpcStrideConcurrency: positiveInteger(
      env.RPC_STRIDE_CONCURRENCY ?? "5",
      "RPC_STRIDE_CONCURRENCY",
    ),
    sqdGateway: optional(env.SQD_GATEWAY),
    sqdApiKey: gatewayApiKey(env),
  };
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} env var is required`);
  return value;
}

function optional(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

function optionalNonNegativeInteger(
  value: string | undefined,
  name: string,
): number | undefined {
  const configured = optional(value);
  return configured == null ? undefined : nonNegativeInteger(configured, name);
}

function gatewayApiKey(env: NodeJS.ProcessEnv): string | undefined {
  const gateway = optional(env.SQD_GATEWAY);
  const apiKey = optional(env.SQD_API_KEY);

  if (gateway && !apiKey) {
    throw new Error("SQD_API_KEY env var is required when using SQD_GATEWAY");
  }

  return apiKey;
}

function rpcNetwork(value: string | undefined): string | number {
  const network = value?.trim() || "ethereum-mainnet";
  if (!/^\d+$/.test(network)) return network;

  return nonNegativeInteger(network, "RPC_NETWORK");
}

function positiveInteger(value: string, name: string): number {
  const parsed = nonNegativeInteger(value, name);
  if (parsed === 0) throw new Error(`${name} must be a positive integer`);
  return parsed;
}

function nonNegativeInteger(value: string, name: string): number {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }

  return parsed;
}
