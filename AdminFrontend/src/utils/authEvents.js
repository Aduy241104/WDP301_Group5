export const AUTH_LOGOUT_EVENT = "auth:logout";

export function emitLogout(reason = "unauthorized") {
    window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT, { detail: { reason } }));
}
