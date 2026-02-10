<script lang="ts">
	import { CALIBRATION_MIN, CALIBRATION_MAX } from '$lib/tuner-geometry';

	interface Props {
		pitchCenter: number;
		onPitchCenterChange: (value: number) => void;
	}

	let { pitchCenter, onPitchCenterChange }: Props = $props();

	let showStepper = $state(false);

	function selectPreset(value: number) {
		onPitchCenterChange(value);
	}

	function increment() {
		if (pitchCenter < CALIBRATION_MAX) {
			onPitchCenterChange(pitchCenter + 1);
		}
	}

	function decrement() {
		if (pitchCenter > CALIBRATION_MIN) {
			onPitchCenterChange(pitchCenter - 1);
		}
	}
</script>

<div class="flex flex-col items-center gap-2">
	<div class="flex items-center gap-2">
		<!-- A432 preset -->
		<button
			onclick={() => selectPreset(432)}
			class="rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200
				{pitchCenter === 432
				? 'border-accent-amber/50 bg-accent-amber/15 text-accent-amber'
				: 'border-border-default bg-bg-surface/50 text-text-secondary hover:border-accent-amber/30 hover:text-text-primary'}"
			style="min-height: 44px; min-width: 44px;"
		>
			A432
		</button>

		<!-- A440 preset -->
		<button
			onclick={() => selectPreset(440)}
			class="rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200
				{pitchCenter === 440
				? 'border-accent-amber/50 bg-accent-amber/15 text-accent-amber'
				: 'border-border-default bg-bg-surface/50 text-text-secondary hover:border-accent-amber/30 hover:text-text-primary'}"
			style="min-height: 44px; min-width: 44px;"
		>
			A440
		</button>

		<!-- Gear toggle -->
		<button
			onclick={() => (showStepper = !showStepper)}
			class="flex items-center justify-center rounded-full border border-border-default bg-bg-surface/50 text-text-secondary transition-all duration-200 hover:border-accent-amber/30 hover:text-text-primary"
			style="min-height: 44px; min-width: 44px;"
			aria-label="Custom pitch reference"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
				<path
					d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
					stroke="currentColor"
					stroke-width="1.5"
				/>
				<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
			</svg>
		</button>
	</div>

	<!-- Stepper (hidden by default) -->
	{#if showStepper}
		<div class="flex items-center gap-3">
			<button
				onclick={decrement}
				disabled={pitchCenter <= CALIBRATION_MIN}
				class="flex items-center justify-center rounded-full border border-border-default bg-bg-surface/50 text-text-secondary transition-all duration-200 hover:border-accent-amber/30 hover:text-text-primary disabled:opacity-30 disabled:hover:border-border-default disabled:hover:text-text-secondary"
				style="min-height: 44px; min-width: 44px;"
				aria-label="Decrease pitch reference"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
			</button>

			<span class="min-w-[4rem] text-center text-sm tabular-nums text-text-primary">
				A{pitchCenter}
			</span>

			<button
				onclick={increment}
				disabled={pitchCenter >= CALIBRATION_MAX}
				class="flex items-center justify-center rounded-full border border-border-default bg-bg-surface/50 text-text-secondary transition-all duration-200 hover:border-accent-amber/30 hover:text-text-primary disabled:opacity-30 disabled:hover:border-border-default disabled:hover:text-text-secondary"
				style="min-height: 44px; min-width: 44px;"
				aria-label="Increase pitch reference"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<path
						d="M12 5v14m-7-7h14"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>
	{/if}
</div>
