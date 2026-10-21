import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadConfig } from "./config.js";
import { toPortalUrl } from "./legacy-portal.js";

const requiredEnv = {
  RPC_ENDPOINT: "https://rpc.example",
  STATE_ORACLE_ADDRESS: "0x1234",
};

describe("indexer configuration", () => {
  it("defaults to Ethereum mainnet native finality", () => {
    const config = loadConfig(requiredEnv);

    assert.equal(config.rpcNetwork, "ethereum-mainnet");
    assert.equal(config.finalityConfirmation, undefined);
  });

  it("accepts a network slug", () => {
    const config = loadConfig({
      ...requiredEnv,
      RPC_NETWORK: "linea-mainnet",
    });

    assert.equal(config.rpcNetwork, "linea-mainnet");
  });

  it("accepts a numeric chain identifier", () => {
    const config = loadConfig({ ...requiredEnv, RPC_NETWORK: "59144" });

    assert.equal(config.rpcNetwork, 59144);
  });

  it("uses a configured confirmation depth", () => {
    assert.equal(
      loadConfig({
        ...requiredEnv,
        FINALITY_CONFIRMATION: "64",
      }).finalityConfirmation,
      64,
    );
  });

  it("keeps existing deployments on their configured confirmation depth", () => {
    assert.equal(
      loadConfig({
        ...requiredEnv,
        FINALITY_CONFIRMATION: "5",
      }).finalityConfirmation,
      5,
    );
  });

  it("rejects invalid confirmation depths", () => {
    for (const confirmation of ["-1", "1.5", "not-a-number"]) {
      assert.throws(
        () =>
          loadConfig({
            ...requiredEnv,
            FINALITY_CONFIRMATION: confirmation,
          }),
        /non-negative integer/,
      );
    }
  });

  it("requires RPC and State Oracle configuration", () => {
    assert.throws(() => loadConfig({}), /RPC_ENDPOINT env var is required/);
    assert.throws(
      () => loadConfig({ RPC_ENDPOINT: "https://rpc.example" }),
      /STATE_ORACLE_ADDRESS env var is required/,
    );
  });

  it("requires an API key when the SQD gateway is configured", () => {
    assert.throws(
      () =>
        loadConfig({
          ...requiredEnv,
          SQD_GATEWAY:
            "https://v2.archive.subsquid.io/network/ethereum-mainnet",
        }),
      /SQD_API_KEY env var is required/,
    );
  });
});

describe("Subsquid Portal configuration", () => {
  it("translates a legacy gateway URL to its Portal dataset", () => {
    assert.equal(
      toPortalUrl("https://v2.archive.subsquid.io/network/ethereum-mainnet"),
      "https://portal.sqd.dev/datasets/ethereum-mainnet",
    );
  });

  it("preserves an explicit Portal URL", () => {
    const portal = "https://portal.sqd.dev/datasets/linea-mainnet";
    assert.equal(toPortalUrl(portal), portal);
  });
});
