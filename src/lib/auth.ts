export const AUTH_DISABLED = process.env.NEXT_PUBLIC_AUTH_DISABLED === "true";

export function isAuthEnabled() {
  return !AUTH_DISABLED;
}
