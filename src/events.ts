import { events } from "./abi/StateOracle.js";
import { events as legacyEvents } from "./abi/StateOracleLegacy.js";

export const AssertionAddedNewEvent = events.AssertionAdded;
export const AssertionAddedLegacyEvent = legacyEvents.AssertionAdded;
export const AssertionRemovedEvent = events.AssertionRemoved;
