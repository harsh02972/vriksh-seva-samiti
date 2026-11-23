/**
 * Feature switches read from environment variables (server side only).
 *
 * ADMIN_ENABLED: the admin panel at /admin exists only when this is exactly "true".
 * Anything else (unset, "false", "1", …) makes every /admin page a 404 and turns admin
 * login off. The public website is not affected. Changing it on Netlify needs a redeploy.
 */
export function isAdminEnabled() {
  return process.env.ADMIN_ENABLED === "true";
}
