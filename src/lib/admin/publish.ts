import "server-only";
import { refresh, updateTag } from "next/cache";
import { SITE_TAG } from "../content";

/**
 * Call after every successful admin save (inside a Server Action):
 * expires the public site's cached data so the next visitor sees the change
 * immediately (no rebuild), and refreshes the admin screen.
 */
export function publish() {
  updateTag(SITE_TAG);
  refresh();
}
