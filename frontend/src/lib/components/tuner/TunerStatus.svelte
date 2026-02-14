<script lang="ts">
	import type { PitchDetectorStatus } from '$lib/stores/pitch-detector';
	import type { AudioError } from '$lib/audio-pipeline';

	interface Props {
		status: PitchDetectorStatus;
		error: AudioError | null;
		isDetecting: boolean;
		onStart: () => void;
		onStop: () => void;
	}

	let { status, error, isDetecting, onStart, onStop }: Props = $props();

	const errorMessages: Record<AudioError, string> = {
		'permission-denied':
			'Microphone access was denied. Please allow microphone access in your browser settings.',
		'no-microphone': 'No microphone found. Please connect a microphone and try again.',
		'not-supported': 'Your browser does not support audio input. Please try a modern browser.',
		unknown: 'Something went wrong accessing the microphone. Please try again.'
	};

	let errorMessage = $derived(error ? errorMessages[error] : null);
	let showPrompt = $derived(status === 'active' && !isDetecting);
</script>

<div class="flex flex-col items-center gap-3">
	<!-- Error message -->
	{#if errorMessage}
		<p class="max-w-xs text-center text-sm text-accent-red" role="alert">
			{errorMessage}
		</p>
	{/if}

	<!-- "Play a string..." prompt -->
	{#if showPrompt}
		<p class="text-sm text-text-secondary">Play a string...</p>
	{/if}

	<!-- Start / Stop button -->
	{#if status === 'idle' || status === 'error'}
		<button
			onclick={onStart}
			class="rounded-full border border-accent-green/30 bg-accent-green/15 px-8 py-3 text-sm font-medium text-accent-green transition-all duration-200 hover:border-accent-green/50 hover:bg-accent-green/25"
			style="min-height: 44px;"
		>
			Start Tuning
		</button>
	{:else if status === 'requesting-permission'}
		<button
			disabled
			class="rounded-full border border-border-default bg-bg-surface/50 px-8 py-3 text-sm font-medium text-text-muted"
			style="min-height: 44px;"
		>
			Listening...
		</button>
	{:else}
		<button
			onclick={onStop}
			class="rounded-full border border-accent-red/30 bg-accent-red/15 px-8 py-3 text-sm font-medium text-accent-red transition-all duration-200 hover:border-accent-red/50 hover:bg-accent-red/25"
			style="min-height: 44px;"
		>
			Stop
		</button>
	{/if}
</div>
