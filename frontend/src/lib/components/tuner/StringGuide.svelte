<script lang="ts">
	import { tunerMode, jumpToString, resetStrings } from '$lib/stores/tuner-mode';

	interface Props {
		reducedMotion?: boolean;
	}

	let { reducedMotion = false }: Props = $props();

	let allTuned = $derived($tunerMode.stringStatus.every((s) => s.inTune));

	// Display strings from low E (index 0 = string 6) to high E (index 5 = string 1)
	let strings = $derived(
		$tunerMode.activeTuning.notes.map((note, index) => ({
			note,
			index,
			stringNumber: $tunerMode.activeTuning.notes.length - index,
			status: $tunerMode.stringStatus[index],
			isCurrent: $tunerMode.currentStringIndex === index
		}))
	);
</script>

<div class="w-full" aria-label="Guitar strings">
	<div class="flex flex-col gap-1.5" aria-live="polite">
		{#each strings as { note, index, stringNumber, status, isCurrent } (index)}
			<button
				onclick={() => jumpToString(index)}
				class="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all
					{reducedMotion ? '' : 'duration-200'}
					{isCurrent && !status.inTune
					? 'bg-accent-amber/10 ring-1 ring-accent-amber/30'
					: status.inTune
						? 'opacity-60'
						: 'hover:bg-bg-surface/80'}"
				style="min-height: 44px;"
				aria-label="String {stringNumber}, {note.name}{note.octave}{status.inTune
					? ', tuned'
					: isCurrent
						? ', currently tuning'
						: ''}"
			>
				<!-- String number badge -->
				<span
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold
						{isCurrent && !status.inTune
						? 'bg-accent-amber/20 text-accent-amber'
						: status.inTune
							? 'bg-accent-green/20 text-accent-green'
							: 'bg-bg-surface text-text-secondary'}"
				>
					{stringNumber}
				</span>

				<!-- Note name -->
				<span
					class="flex-1 text-sm font-medium
						{isCurrent && !status.inTune
						? 'text-text-primary'
						: status.inTune
							? 'text-text-secondary'
							: 'text-text-secondary'}"
				>
					{note.name}{note.octave}
				</span>

				<!-- Status icon -->
				{#if status.inTune}
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						class="shrink-0 text-accent-green"
					>
						<path
							d="M20 6L9 17l-5-5"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				{:else if isCurrent}
					<span
						class="h-2 w-2 shrink-0 rounded-full bg-accent-amber
							{reducedMotion ? '' : 'animate-pulse'}"
					></span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Completion state -->
	{#if allTuned}
		<div
			class="mt-3 flex flex-col items-center gap-2 rounded-lg bg-accent-green/10 px-4 py-3 text-center"
		>
			<span class="text-sm font-medium text-accent-green">All tuned up!</span>
			<button
				onclick={resetStrings}
				class="text-xs text-text-secondary underline decoration-text-secondary/30 transition-colors duration-200 hover:text-text-primary"
			>
				Reset
			</button>
		</div>
	{:else}
		<div class="mt-2 flex justify-center">
			<button
				onclick={resetStrings}
				class="text-xs text-text-secondary transition-colors duration-200 hover:text-text-primary"
			>
				Reset
			</button>
		</div>
	{/if}
</div>
