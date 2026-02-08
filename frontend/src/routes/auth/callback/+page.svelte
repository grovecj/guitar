<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { setToken, fetchMe } from '$lib/stores/auth';

	onMount(async () => {
		const token = page.url.searchParams.get('token');
		if (token) {
			setToken(token);
			await fetchMe();
		}
		// Replace the URL so the token isn't sitting in the address bar
		window.location.replace('/');
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<p class="text-text-secondary">Signing you in...</p>
</div>
