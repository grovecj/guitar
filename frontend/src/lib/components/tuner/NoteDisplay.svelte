<script lang="ts">
	import { centsToColorZone, centsToDirection } from '$lib/tuner-geometry';

	interface Props {
		noteName: string | null;
		octave: number | null;
		cents: number;
		frequency: number | null;
		isDetecting: boolean;
		showFrequency: boolean;
	}

	let { noteName, octave, cents, frequency, isDetecting, showFrequency }: Props = $props();

	let zone = $derived(centsToColorZone(cents));
	let direction = $derived(centsToDirection(cents));

	let centsColor = $derived(
		zone === 'green'
			? 'text-accent-green'
			: zone === 'yellow'
				? 'text-accent-amber'
				: 'text-accent-red'
	);

	let centsSign = $derived(cents > 0 ? '+' : '');

	let srAnnouncement = $derived(
		isDetecting && noteName
			? `${noteName}${octave}, ${centsSign}${cents} cents`
			: 'No note detected'
	);
</script>

<!-- Screen reader announcement -->
<div class="sr-only" aria-live="polite" role="status">
	{srAnnouncement}
</div>

<div class="flex flex-col items-center gap-1">
	<!-- Directional hint -->
	<div class="flex h-8 items-center gap-1.5">
		{#if !isDetecting}
			<span class="text-sm text-text-muted">&nbsp;</span>
		{:else if direction === 'flat'}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-accent-amber">
				<path
					d="M12 19V5m-7 7 7-7 7 7"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span class="text-sm font-medium text-accent-amber">Tune Up</span>
		{:else if direction === 'sharp'}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-accent-amber">
				<path
					d="M12 5v14m7-7-7 7-7-7"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span class="text-sm font-medium text-accent-amber">Tune Down</span>
		{:else}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-accent-green">
				<path
					d="M20 6 9 17l-5-5"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span class="text-sm font-medium text-accent-green">In Tune</span>
		{/if}
	</div>

	<!-- Note name -->
	<div class="flex items-baseline gap-1">
		<span
			class="font-display text-6xl leading-none sm:text-7xl {isDetecting && noteName
				? 'text-text-primary'
				: 'text-text-muted'}"
		>
			{isDetecting && noteName ? noteName : '--'}
		</span>
		{#if isDetecting && octave !== null}
			<span class="text-2xl text-text-secondary">{octave}</span>
		{/if}
	</div>

	<!-- Cents readout -->
	<div class="flex h-7 items-center">
		{#if isDetecting && noteName}
			<span class="text-lg font-medium tabular-nums {centsColor}">
				{centsSign}{cents} cents
			</span>
		{:else}
			<span class="text-lg text-text-muted">&nbsp;</span>
		{/if}
	</div>

	<!-- Frequency (opt-in) -->
	{#if showFrequency}
		<div class="h-5">
			{#if isDetecting && frequency}
				<span class="text-xs tabular-nums text-text-secondary">
					{frequency.toFixed(1)} Hz
				</span>
			{:else}
				<span class="text-xs text-text-muted">&nbsp;</span>
			{/if}
		</div>
	{/if}
</div>
