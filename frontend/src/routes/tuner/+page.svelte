<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { resolve } from '$app/paths';
	import {
		pitchDetectorState,
		pitchDetectionResult,
		pitchDetectionConfig,
		startPitchDetection,
		stopPitchDetection,
		updateConfig
	} from '$lib/stores/pitch-detector';
	import TunerGauge from '$lib/components/tuner/TunerGauge.svelte';
	import NoteDisplay from '$lib/components/tuner/NoteDisplay.svelte';
	import StabilityIndicator from '$lib/components/tuner/StabilityIndicator.svelte';
	import CalibrationControl from '$lib/components/tuner/CalibrationControl.svelte';
	import TunerStatus from '$lib/components/tuner/TunerStatus.svelte';
	import TuningSelector from '$lib/components/tuner/TuningSelector.svelte';
	import StringGuide from '$lib/components/tuner/StringGuide.svelte';
	import { tunerMode, updateGuidedState } from '$lib/stores/tuner-mode';

	let reducedMotion = $state(false);
	let showFrequency = $state(false);

	// Feed pitch data into guided mode store
	$effect(() => {
		const result = $pitchDetectionResult;
		const mode = $tunerMode;
		if (mode.mode === 'guided' && result.isDetecting) {
			updateGuidedState({
				note: result.note,
				stability: result.stability,
				isDetecting: result.isDetecting
			});
		}
	});

	// Derive guided mode context for the note display
	let guidedContext = $derived.by(() => {
		const mode = $tunerMode;
		if (mode.mode !== 'guided' || mode.currentStringIndex === null) return null;
		const note = mode.activeTuning.notes[mode.currentStringIndex];
		const stringNumber = mode.activeTuning.notes.length - mode.currentStringIndex;
		return { note, stringNumber };
	});

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mq.matches;
		const handler = (e: MediaQueryListEvent) => {
			reducedMotion = e.matches;
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	onDestroy(() => {
		stopPitchDetection();
	});

	function handlePitchCenterChange(value: number) {
		updateConfig({ pitchCenter: value });
	}
</script>

<svelte:head>
	<title>Tuner — Guitar</title>
</svelte:head>

<!-- Ambient background (same as landing page) -->
<div class="fixed inset-0 -z-10 overflow-hidden">
	<div
		class="absolute top-1/4 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
		style="background: radial-gradient(circle, #d4a053 0%, transparent 70%);"
	></div>
	<div
		class="absolute right-0 bottom-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full opacity-10"
		style="background: radial-gradient(circle, #5b8fd4 0%, transparent 70%);"
	></div>
	<div
		class="absolute inset-0 opacity-[0.03]"
		style="background-image: url('data:image/svg+xml,<svg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>');"
	></div>
</div>

<div class="flex min-h-screen flex-col">
	<!-- Nav -->
	<nav class="flex items-center justify-between px-6 py-5 md:px-12">
		<a
			href={resolve('/')}
			class="flex items-center gap-2.5 text-text-secondary transition-colors duration-200 hover:text-text-primary"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
				<path
					d="M19 12H5m7-7-7 7 7 7"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span class="text-sm">Back</span>
		</a>

		<h1 class="font-display text-lg tracking-wide text-text-primary">Tuner</h1>

		<!-- Frequency toggle -->
		<button
			onclick={() => (showFrequency = !showFrequency)}
			class="flex items-center justify-center rounded-full text-text-secondary transition-colors duration-200 hover:text-text-primary {showFrequency
				? 'text-accent-amber'
				: ''}"
			style="min-height: 44px; min-width: 44px;"
			aria-label="Toggle frequency display"
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
				<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
				<path d="M12 16v-4m0-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
		</button>
	</nav>

	<!-- Main content -->
	<main class="flex flex-1 flex-col items-center justify-center px-6 pb-12">
		<div
			class="w-full max-w-lg overflow-hidden rounded-2xl border border-border-default bg-bg-surface/50 p-6 backdrop-blur-sm sm:p-8"
		>
			<div class="flex flex-col items-center gap-6">
				<!-- Tuning selector -->
				<TuningSelector />

				<!-- Gauge -->
				<TunerGauge
					cents={$pitchDetectionResult.cents}
					stability={$pitchDetectionResult.stability}
					isDetecting={$pitchDetectionResult.isDetecting}
					{reducedMotion}
				/>

				<!-- Guided mode target context -->
				{#if guidedContext}
					<p class="text-xs text-text-secondary">
						String {guidedContext.stringNumber} — {guidedContext.note.name}{guidedContext.note
							.octave}
					</p>
				{/if}

				<!-- Note display -->
				<NoteDisplay
					noteName={$pitchDetectionResult.note?.name ?? null}
					octave={$pitchDetectionResult.note?.octave ?? null}
					cents={$pitchDetectionResult.cents}
					frequency={$pitchDetectionResult.frequency}
					isDetecting={$pitchDetectionResult.isDetecting}
					{showFrequency}
				/>

				<!-- Stability bar -->
				<div class="w-full max-w-xs">
					<StabilityIndicator
						stability={$pitchDetectionResult.stability}
						isDetecting={$pitchDetectionResult.isDetecting}
						{reducedMotion}
					/>
				</div>

				<!-- String guide (guided mode only) -->
				{#if $tunerMode.mode === 'guided'}
					<div class="w-full">
						<StringGuide {reducedMotion} />
					</div>
				{/if}

				<!-- Start/Stop + errors -->
				<TunerStatus
					status={$pitchDetectorState.status}
					error={$pitchDetectorState.error}
					isDetecting={$pitchDetectionResult.isDetecting}
					onStart={startPitchDetection}
					onStop={stopPitchDetection}
				/>

				<!-- Calibration -->
				<CalibrationControl
					pitchCenter={$pitchDetectionConfig.pitchCenter}
					onPitchCenterChange={handlePitchCenterChange}
				/>
			</div>
		</div>
	</main>
</div>
