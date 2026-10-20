import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Sink, uint256 } from "@subsquid/evm-codec";
import { AssertionRemovedEvent } from "./events.js";

const adopter = "0x1111111111111111111111111111111111111111";
const assertionId =
  "0xabababababababababababababababababababababababababababababababab";
const deactivationBlock = 42n;

describe("AssertionRemoved indexed layout", () => {
  it("decodes adopter and assertion id from topics", () => {
    const sink = new Sink(1);
    uint256.encode(sink, deactivationBlock);
    const decoded = AssertionRemovedEvent.decode({
      topics: [
        AssertionRemovedEvent.topic,
        "0x0000000000000000000000001111111111111111111111111111111111111111",
        assertionId,
      ],
      data: sink.toString(),
    });
    assert.equal(decoded.assertionAdopter, adopter);
    assert.equal(decoded.assertionId, assertionId);
    assert.equal(decoded.deactivationBlock, deactivationBlock);
  });
});
