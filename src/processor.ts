import {
  EvmFallbackDataSourceBuilder,
  type EvmFallbackSourceConfig,
} from "@subsquid/squid-sdk/evm/fallback";
import { loadConfig } from "./config.js";
import {
  AssertionAddedLegacyEvent,
  AssertionAddedNewEvent,
  AssertionRemovedEvent,
  StorageResetEvent,
} from "./events.js";
import { toPortalUrl } from "./legacy-portal.js";

const config = loadConfig();

const rpcSource = {
  type: "rpc",
  name: "rpc",
  url: config.rpcEndpoint,
  network: config.rpcNetwork,
  rateLimit: config.rpcRateLimit,
  capacity: config.rpcCapacity,
  strideSize: config.rpcStrideSize,
  strideConcurrency: config.rpcStrideConcurrency,
  rpc:
    config.finalityConfirmation == null
      ? undefined
      : { finalityConfirmation: config.finalityConfirmation },
} satisfies EvmFallbackSourceConfig;

const sources: EvmFallbackSourceConfig[] = [rpcSource];

if (config.sqdGateway && config.sqdApiKey) {
  const portalSource = {
    type: "portal",
    name: "portal",
    url: toPortalUrl(config.sqdGateway),
    http: {
      headers: {
        Authorization: `Bearer ${config.sqdApiKey}`,
        Token: config.sqdApiKey,
      },
    },
  } satisfies EvmFallbackSourceConfig;

  // Portal is the fastest primary for native finality. Confirmation mode keeps
  // RPC primary so its exact depth is honored, with Portal as a safer fallback.
  if (config.finalityConfirmation == null) {
    sources.unshift(portalSource);
  } else {
    sources.push(portalSource);
  }
}

export const dataSource = new EvmFallbackDataSourceBuilder()
  .setDownstreamSources(sources)
  .setFields({
    log: {
      topics: true,
      data: true,
      address: true,
      transactionHash: true,
      logIndex: true,
    },
  })
  .setBlockRange({ from: config.stateOracleDeploymentBlock })
  .addLog({
    where: {
      address: [config.stateOracleAddress],
      topic0: [
        AssertionAddedNewEvent.topic,
        AssertionAddedLegacyEvent.topic,
        AssertionRemovedEvent.topic,
        StorageResetEvent.topic,
      ],
    },
  })
  .build();
