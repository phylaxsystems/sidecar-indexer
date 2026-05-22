import { TypeormDatabase } from "@subsquid/typeorm-store";
import {
  AssertionAddedLegacyEvent,
  AssertionAddedNewEvent,
  AssertionRemovedEvent,
  StorageResetEvent,
} from "./events.js";
import { AssertionAdded } from "./model/generated/assertionAdded.model.js";
import { AssertionRemoved } from "./model/generated/assertionRemoved.model.js";
import { StorageReset } from "./model/generated/storageReset.model.js";
import { processor } from "./processor.js";

const db = new TypeormDatabase({ supportHotBlocks: false });

processor.run(db, async (ctx) => {
  const added: AssertionAdded[] = [];
  const removed: AssertionRemoved[] = [];
  const resets: StorageReset[] = [];

  for (const block of ctx.blocks) {
    for (const log of block.logs) {
      if (log.topics[0] === AssertionAddedNewEvent.topic) {
        const decoded = AssertionAddedNewEvent.decode(log);
        added.push(
          new AssertionAdded({
            id: log.id,
            block: block.header.height,
            txHash: log.transactionHash,
            logIndex: log.logIndex,
            assertionAdopter: decoded.assertionAdopter,
            assertionId: decoded.assertionId,
            activationBlock: decoded.activationBlock,
            daVerifier: decoded.daVerifier,
            metadata: decoded.metadata,
            proof: decoded.proof,
          }),
        );
        ctx.log.info(
          {
            block: block.header.height,
            adopter: decoded.assertionAdopter,
            assertionId: decoded.assertionId,
            daVerifier: decoded.daVerifier,
          },
          "AssertionAdded",
        );
      }

      if (log.topics[0] === AssertionAddedLegacyEvent.topic) {
        const decoded = AssertionAddedLegacyEvent.decode(log);
        added.push(
          new AssertionAdded({
            id: log.id,
            block: block.header.height,
            txHash: log.transactionHash,
            logIndex: log.logIndex,
            assertionAdopter: decoded.assertionAdopter,
            assertionId: decoded.assertionId,
            activationBlock: decoded.activationBlock,
            daVerifier: "0x0000000000000000000000000000000000000000",
            metadata: "0x",
            proof: "0x",
          }),
        );
        ctx.log.info(
          {
            block: block.header.height,
            adopter: decoded.assertionAdopter,
            assertionId: decoded.assertionId,
          },
          "AssertionAdded (legacy)",
        );
      }

      if (log.topics[0] === AssertionRemovedEvent.topic) {
        const decoded = AssertionRemovedEvent.decode(log);
        removed.push(
          new AssertionRemoved({
            id: log.id,
            block: block.header.height,
            txHash: log.transactionHash,
            logIndex: log.logIndex,
            assertionAdopter: decoded.assertionAdopter,
            assertionId: decoded.assertionId,
            deactivationBlock: decoded.deactivationBlock,
          }),
        );
        ctx.log.info(
          {
            block: block.header.height,
            adopter: decoded.assertionAdopter,
            assertionId: decoded.assertionId,
          },
          "AssertionRemoved",
        );
      }

      if (log.topics[0] === StorageResetEvent.topic) {
        const decoded = StorageResetEvent.decode(log);
        resets.push(
          new StorageReset({
            id: log.id,
            block: block.header.height,
            txHash: log.transactionHash,
            logIndex: log.logIndex,
            adopter: decoded.adopter,
            storageKey: decoded.storageKey,
            resetBlock: decoded.resetBlock,
          }),
        );
        ctx.log.info(
          {
            block: block.header.height,
            adopter: decoded.adopter,
            storageKey: decoded.storageKey,
            resetBlock: decoded.resetBlock,
          },
          "StorageReset",
        );
      }
    }
  }

  if (added.length > 0) await ctx.store.insert(added);
  if (removed.length > 0) await ctx.store.insert(removed);
  if (resets.length > 0) await ctx.store.insert(resets);
});
