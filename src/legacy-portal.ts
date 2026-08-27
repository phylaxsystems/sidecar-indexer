/**
 * Translates legacy v2 archive gateway URLs to their current Portal dataset URL,
 * so existing SQD_GATEWAY values keep working after the Portal migration.
 */

/** Host of the retired v2 archive gateways. */
const LEGACY_GATEWAY_HOST = "v2.archive.subsquid.io";

/** Portal dataset root that replaced the v2 gateways. */
const PORTAL_DATASET_BASE = "https://portal.sqd.dev/datasets";

/** Legacy gateway path, capturing the network slug: `/network/<slug>`. */
const LEGACY_NETWORK_PATH = /^\/network\/([^/]+)\/?$/;

/** Anything that is not a recognized legacy gateway passes through unchanged. */
export function toPortalUrl(gateway: string): string {
  const url = new URL(gateway);
  const match = url.pathname.match(LEGACY_NETWORK_PATH);

  if (url.hostname === LEGACY_GATEWAY_HOST && match) {
    return `${PORTAL_DATASET_BASE}/${match[1]}`;
  }

  return gateway;
}
