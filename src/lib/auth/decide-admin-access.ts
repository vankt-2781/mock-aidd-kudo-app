import type { Viewer } from "./get-current-viewer";

/** Deny by default: only a server-verified admin may see /admin. */
export function decideAdminAccess(viewer: Viewer): "allow" | "redirect-home" {
  return viewer.signedIn && viewer.isAdmin ? "allow" : "redirect-home";
}
