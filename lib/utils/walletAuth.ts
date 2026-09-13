export function getLocaleFromPathname(path: string) {
  return /^\/(en|ru)(\/|$)/.exec(path)?.[1] || "az";
}
export function safeReturnPath(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return "/advertiser";
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin
      ? url.pathname + url.search
      : "/advertiser";
  } catch {
    return "/advertiser";
  }
}
function base64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
export async function openWalletLogin({
  locale = "az",
  onSuccess,
  onError,
}: {
  locale?: string;
  onSuccess?: () => void;
  onError?: (s: string) => void;
} = {}) {
  const wallet = process.env.NEXT_PUBLIC_WALLET_URL || "https://kimlik.az";
  const popup =
    window.innerWidth > 640
      ? window.open("about:blank", "reklam-login", "width=460,height=640")
      : null;
  try {
    if (!crypto.subtle) throw Error("secure_context_required");
    const verifier = base64(crypto.getRandomValues(new Uint8Array(32))),
      state = base64(crypto.getRandomValues(new Uint8Array(24)));
    const challenge = base64(
      new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(verifier),
        ),
      ),
    );
    localStorage.setItem("wallet_code_verifier", verifier);
    localStorage.setItem("wallet_oauth_state", state);
    localStorage.setItem("wallet_oauth_time", String(Date.now()));
    localStorage.setItem(
      "wallet_return_path",
      safeReturnPath(window.location.pathname + window.location.search),
    );
    localStorage.setItem("wallet_locale", locale);
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_WALLET_CLIENT_ID || "",
      redirect_uri: `${window.location.origin}/auth/wallet/callback`,
      scope: "profile:name profile:email profile:phone verification:read",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
      response_type: "code",
    });
    const url = `${wallet}/${locale}/oauth/authorize?${params}`;
    if (!popup) {
      // OAuth intentionally leaves this application for the identity provider.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(url);
      return;
    }
    const deadline = Date.now() + 600000;
    function cleanup() {
      window.removeEventListener("message", message);
      clearInterval(timer);
    }
    function message(event: MessageEvent) {
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        event.data?.state !== state
      )
        return;
      if (event.data.type === "oauth_success") {
        cleanup();
        popup?.close();
        window.dispatchEvent(new Event("authStateChanged"));
        if (onSuccess) onSuccess();
        else window.location.reload();
      }
      if (event.data.type === "oauth_error") {
        cleanup();
        popup?.close();
        onError?.("login_failed");
      }
    }
    window.addEventListener("message", message);
    const timer = setInterval(() => {
      if (popup.closed || Date.now() > deadline) {
        cleanup();
        popup.close();
        onError?.("login_cancelled");
      }
    }, 500);
    popup.location.href = url;
  } catch {
    popup?.close();
    onError?.("login_failed");
  }
}
