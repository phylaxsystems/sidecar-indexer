import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { address, bytes32, Sink, uint256 } from "@subsquid/evm-codec";
import {
  AssertionRemovedEvent,
  AssertionRemovedLegacyEvent,
  decodeAssertionRemoved,
} from "./events.js";

const adopter = "0x1111111111111111111111111111111111111111";
const assertionId =
  "0xabababababababababababababababababababababababababababababababab";
const deactivationBlock = 42n;
const adopterTopic =
  "0x0000000000000000000000001111111111111111111111111111111111111111";

function data(words: number, write: (sink: Sink) => void): string {
  const sink = new Sink(words);
  write(sink);
  return sink.toString();
}

describe("decodeAssertionRemoved", () => {
  it("reads adopter and assertion id from a 3-topic log", () => {
    const decoded = decodeAssertionRemoved({
      topics: [AssertionRemovedEvent.topic, adopterTopic, assertionId],
      data: data(1, (sink) => {
        uint256.encode(sink, deactivationBlock);
      }),
    });
    assert.equal(decoded.assertionAdopter, adopter);
    assert.equal(decoded.assertionId, assertionId);
    assert.equal(decoded.deactivationBlock, deactivationBlock);
  });

  it("reads adopter, assertion id, and deactivation block from a 1-topic log", () => {
    const decoded = decodeAssertionRemoved({
      topics: [AssertionRemovedLegacyEvent.topic],
      data: data(3, (sink) => {
        address.encode(sink, adopter);
        bytes32.encode(sink, assertionId);
        uint256.encode(sink, deactivationBlock);
      }),
    });
    assert.equal(decoded.assertionAdopter, adopter);
    assert.equal(decoded.assertionId, assertionId);
    assert.equal(decoded.deactivationBlock, deactivationBlock);
  });
});
