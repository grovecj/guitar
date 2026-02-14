<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { user, authLoading, logout } from '$lib/stores/auth';

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	function signIn() {
		window.location.href = '/api/auth/google';
	}
</script>

<!-- Ambient background -->
<div class="fixed inset-0 -z-10 overflow-hidden">
	<!-- Warm radial glow — like an amp in a dark room -->
	<div
		class="absolute top-1/4 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
		style="background: radial-gradient(circle, #d4a053 0%, transparent 70%);"
	></div>
	<!-- Subtle secondary glow -->
	<div
		class="absolute right-0 bottom-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full opacity-10"
		style="background: radial-gradient(circle, #5b8fd4 0%, transparent 70%);"
	></div>
	<!-- Noise texture overlay -->
	<div
		class="absolute inset-0 opacity-[0.03]"
		style="background-image: url('data:image/svg+xml,<svg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>');"
	></div>
</div>

<div class="relative flex min-h-screen flex-col">
	<!-- Nav bar -->
	<nav
		class="flex items-center justify-between px-6 py-5 md:px-12"
		class:opacity-0={!mounted}
		class:opacity-100={mounted}
		style="transition: opacity 0.6s ease;"
	>
		<div class="flex items-center gap-2.5">
			<!-- Tuning fork icon -->
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-accent-amber">
				<path
					d="M12 2v8m0 4v8M8 2v6a4 4 0 0 0 8 0V2"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
			<span class="font-display text-lg tracking-wide text-text-primary">Guitar</span>
		</div>
		{#if $authLoading}
			<div class="h-10 w-10"></div>
		{:else if $user}
			<div class="flex items-center gap-3">
				<img
					src={$user.avatar_url}
					alt={$user.display_name}
					class="h-8 w-8 rounded-full border border-border-default"
				/>
				<span class="hidden text-sm text-text-secondary sm:inline">{$user.display_name}</span>
				<button
					onclick={() => logout()}
					class="rounded-full border border-border-default bg-bg-surface/60 px-4 py-2 text-xs font-medium text-text-secondary transition-all duration-200 hover:border-accent-red/40 hover:text-accent-red"
				>
					Sign out
				</button>
			</div>
		{:else}
			<button
				onclick={signIn}
				class="flex items-center gap-2.5 rounded-full border border-border-default bg-bg-surface/60 px-5 py-2.5 text-sm font-medium text-text-primary backdrop-blur-sm transition-all duration-200 hover:border-accent-amber/40 hover:bg-bg-elevated/80"
			>
				<svg width="16" height="16" viewBox="0 0 24 24">
					<path
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
						fill="#4285F4"
					/>
					<path
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						fill="#34A853"
					/>
					<path
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						fill="#FBBC05"
					/>
					<path
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						fill="#EA4335"
					/>
				</svg>
				Sign in with Google
			</button>
		{/if}
	</nav>

	<!-- Hero -->
	<main class="flex flex-1 flex-col items-center justify-center px-6 pb-24 md:px-12">
		<div
			class="max-w-2xl text-center"
			class:opacity-0={!mounted}
			class:opacity-100={mounted}
			style="transition: opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s; transform: translateY({mounted
				? '0'
				: '12px'});"
		>
			<p
				class="mb-5 inline-block rounded-full border border-accent-amber/20 bg-accent-amber/5 px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-accent-amber"
			>
				Practice smarter
			</p>

			<h1
				class="font-display mb-6 text-5xl leading-[1.1] font-normal tracking-tight text-text-primary sm:text-7xl"
			>
				Your guitar,<br />
				<span class="italic text-accent-amber">your session.</span>
			</h1>

			<p class="mx-auto mb-10 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
				A precision tuner, AI-generated backing tracks, and guided practice plans — everything you
				need to build a real practice habit, in one place.
			</p>

			<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
				<button
					onclick={signIn}
					class="group flex items-center gap-2.5 rounded-full bg-accent-amber px-8 py-3.5 text-sm font-semibold text-bg-primary transition-all duration-200 hover:bg-accent-amber-light hover:shadow-[0_0_24px_rgba(212,160,83,0.25)]"
				>
					Get started free
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						class="transition-transform duration-200 group-hover:translate-x-0.5"
					>
						<path
							d="M5 12h14m-6-6 6 6-6 6"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				<span class="text-xs text-text-muted">No credit card required</span>
			</div>
		</div>

		<!-- Feature cards -->
		<div
			class="mt-20 grid w-full max-w-4xl gap-4 sm:grid-cols-3"
			class:opacity-0={!mounted}
			class:opacity-100={mounted}
			style="transition: opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s; transform: translateY({mounted
				? '0'
				: '16px'});"
		>
			<!-- Tuner -->
			<a
				href={resolve('/tuner')}
				class="group relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface/50 p-7 backdrop-blur-sm transition-all duration-300 hover:border-accent-green/30 hover:bg-bg-surface/80"
			>
				<div
					class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					style="background: radial-gradient(circle at 50% 0%, rgba(92, 184, 112, 0.06) 0%, transparent 70%);"
				></div>
				<div class="relative">
					<div
						class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-accent-green/20 bg-accent-green/10"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-accent-green">
							<path
								d="M12 2v20M2 12h4m12 0h4M6.34 6.34l2.83 2.83m5.66 5.66 2.83 2.83M6.34 17.66l2.83-2.83m5.66-5.66 2.83-2.83"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					</div>
					<h3 class="font-display mb-2 text-xl text-text-primary">Tuner</h3>
					<p class="text-sm leading-relaxed text-text-secondary">
						Precision chromatic tuner with real-time pitch detection, preset tunings, and
						string-by-string guidance.
					</p>
				</div>
			</a>

			<!-- Backing Tracks -->
			<div
				class="group relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface/50 p-7 backdrop-blur-sm transition-all duration-300 hover:border-accent-amber/30 hover:bg-bg-surface/80"
			>
				<div
					class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					style="background: radial-gradient(circle at 50% 0%, rgba(212, 160, 83, 0.06) 0%, transparent 70%);"
				></div>
				<div class="relative">
					<div
						class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-accent-amber/20 bg-accent-amber/10"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-accent-amber">
							<path
								d="M9 18V5l12-2v13"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.5" />
							<circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.5" />
						</svg>
					</div>
					<h3 class="font-display mb-2 text-xl text-text-primary">Backing Tracks</h3>
					<p class="text-sm leading-relaxed text-text-secondary">
						AI-generated jams in any key, tempo, and style. Blues, jazz, funk — pick a vibe and
						start playing.
					</p>
				</div>
			</div>

			<!-- Guided Practice -->
			<div
				class="group relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface/50 p-7 backdrop-blur-sm transition-all duration-300 hover:border-accent-blue/30 hover:bg-bg-surface/80"
			>
				<div
					class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					style="background: radial-gradient(circle at 50% 0%, rgba(91, 143, 212, 0.06) 0%, transparent 70%);"
				></div>
				<div class="relative">
					<div
						class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-accent-blue/20 bg-accent-blue/10"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-accent-blue">
							<path
								d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					</div>
					<h3 class="font-display mb-2 text-xl text-text-primary">Guided Practice</h3>
					<p class="text-sm leading-relaxed text-text-secondary">
						Structured sessions with timers, a metronome, and plans that adapt to your skill level
						and goals.
					</p>
				</div>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer
		class="px-6 pb-6 text-center text-xs text-text-muted"
		class:opacity-0={!mounted}
		class:opacity-100={mounted}
		style="transition: opacity 0.8s ease 0.8s;"
	>
		Built for the love of practice.
	</footer>
</div>
