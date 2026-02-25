import { EvmBatchProcessor } from "@subsquid/evm-processor";
import { events } from "./abi/StateOracle.js";

const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
if (!RPC_ENDPOINT) throw new Error("RPC_ENDPOINT env var is required");

const STATE_ORACLE_ADDRESS = process.env.STATE_ORACLE_ADDRESS;
if (!STATE_ORACLE_ADDRESS)
  throw new Error("STATE_ORACLE_ADDRESS env var is required");

const deploymentBlock = Number(
  process.env.STATE_ORACLE_DEPLOYMENT_BLOCK ?? "0",
);

const finalityConfirmation = Number(process.env.FINALITY_CONFIRMATION ?? "64");

export const processor = new EvmBatchProcessor()
  .setRpcEndpoint(RPC_ENDPOINT)
  .setFinalityConfirmation(finalityConfirmation)
  .setFields({
    log: {
      topics: true,
      data: true,
      address: true,
      transactionHash: true,
      logIndex: true,
    },
  })
  .setBlockRange({ from: deploymentBlock })
  .addLog({
    address: [STATE_ORACLE_ADDRESS],
    topic0: [events.AssertionAdded.topic, events.AssertionRemoved.topic],
  });

// Optionally use Subsquid gateway for faster historical sync
const SQD_GATEWAY = process.env.SQD_GATEWAY;
if (SQD_GATEWAY) {
  processor.setGateway(SQD_GATEWAY);
}
