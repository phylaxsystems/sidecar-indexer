import { TypeormDatabase } from "@subsquid/typeorm-store";
import { processor } from "./processor.js";
import { events } from "./abi/StateOracle.js";
import { AssertionAdded } from "./model/generated/assertionAdded.model.js";
import { AssertionRemoved } from "./model/generated/assertionRemoved.model.js";

const db = new TypeormDatabase({ supportHotBlocks: false });

processor.run(db, async (ctx) => {
  const added: AssertionAdded[] = [];
  const removed: AssertionRemoved[] = [];

  for (const block of ctx.blocks) {
    for (const log of block.logs) {
      if (log.topics[0] === events.AssertionAdded.topic) {
        const decoded = events.AssertionAdded.decode(log);
        added.push(
          new AssertionAdded({
            id: log.id,
            block: block.header.height,
            txHash: log.transactionHash,
            assertionAdopter: decoded.assertionAdopter,
            assertionId: decoded.assertionId,
            activationBlock: decoded.activationBlock,
          })
        );
        ctx.log.info(
          {
            block: block.header.height,
            adopter: decoded.assertionAdopter,
            assertionId: decoded.assertionId,
          },
          "AssertionAdded"
        );
      }

      if (log.topics[0] === events.AssertionRemoved.topic) {
        const decoded = events.AssertionRemoved.decode(log);
        removed.push(
          new AssertionRemoved({
            id: log.id,
            block: block.header.height,
            txHash: log.transactionHash,
            assertionAdopter: decoded.assertionAdopter,
            assertionId: decoded.assertionId,
            deactivationBlock: decoded.deactivationBlock,
          })
        );
        ctx.log.info(
          {
            block: block.header.height,
            adopter: decoded.assertionAdopter,
            assertionId: decoded.assertionId,
          },
          "AssertionRemoved"
        );
      }
    }
  }

  if (added.length > 0) await ctx.store.insert(added);
  if (removed.length > 0) await ctx.store.insert(removed);
});
