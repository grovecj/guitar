import { writable } from 'svelte/store';

export interface User {
	id: number;
	email: string;
	display_name: string;
	avatar_url: string;
}

export const user = writable<User | null>(null);
export const accessToken = writable<string | null>(null);
export const authLoading = writable(true);

let currentToken: string | null = null;
accessToken.subscribe((t) => (currentToken = t));

/** Set the access token (stored in memory only, never localStorage). */
export function setToken(token: string) {
	accessToken.set(token);
}

/** Clear auth state (on logout or expired session). */
export function clearAuth() {
	accessToken.set(null);
	user.set(null);
}

/** Fetch the current user profile using the access token. */
export async function fetchMe(): Promise<User | null> {
	if (!currentToken) return null;

	const res = await fetch('/api/auth/me', {
		headers: { Authorization: `Bearer ${currentToken}` }
	});
	if (!res.ok) {
		clearAuth();
		return null;
	}
	const u: User = await res.json();
	user.set(u);
	return u;
}

/** Try to refresh the access token using the HTTP-only refresh cookie. */
export async function refreshToken(): Promise<boolean> {
	const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
	if (!res.ok) {
		clearAuth();
		return false;
	}
	const data = await res.json();
	setToken(data.access_token);
	return true;
}

/** Initialize auth: try refresh, then fetch user. */
export async function initAuth(): Promise<void> {
	authLoading.set(true);
	const ok = await refreshToken();
	if (ok) {
		await fetchMe();
	}
	authLoading.set(false);
}

/** Log out: clear cookie + local state. */
export async function logout(): Promise<void> {
	await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
	clearAuth();
}
