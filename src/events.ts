import { events } from "./abi/StateOracle.js";
import { events as legacyEvents } from "./abi/StateOracleLegacy.js";

export const AssertionAddedNewEvent = events.AssertionAdded;
export const AssertionAddedLegacyEvent = legacyEvents.AssertionAdded;
export const AssertionRemovedEvent = events.AssertionRemoved;
export const AssertionRemovedLegacyEvent = legacyEvents.AssertionRemoved;
export const StorageResetEvent = events.StorageReset;

export function decodeAssertionRemoved(log: {
  topics: string[];
  data: string;
}) {
  if (log.topics.length >= 3) {
    return AssertionRemovedEvent.decode(log);
  }
  return AssertionRemovedLegacyEvent.decode(log);
}
