"use client";

import { useEffect } from "react";

// Dashboard invitations can return to the configured Site URL (often /).
// Keep the credentials in the URL fragment until the acceptance page handles them.
export function AuthRedirectBridge() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    const hasAuthTokens = hash.has("access_token") && hash.has("refresh_token");
    if (hasAuthTokens || hash.has("error") || query.has("code") || query.has("token_hash")) {
      window.location.replace(`/auth/accept${window.location.search}${window.location.hash}`);
    }
  }, []);
  return null;
}
