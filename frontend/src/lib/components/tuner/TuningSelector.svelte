<script lang="ts">
	import { TUNING_PRESETS } from '$lib/music-theory';
	import { tunerMode, selectPreset, selectAutoDetect } from '$lib/stores/tuner-mode';

	function handleChange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		if (value === 'auto-detect') {
			selectAutoDetect();
		} else {
			const preset = TUNING_PRESETS.find((p) => p.id === value);
			if (preset) selectPreset(preset);
		}
	}

	let selectedValue = $derived(
		$tunerMode.mode === 'auto-detect' ? 'auto-detect' : $tunerMode.activeTuning.id
	);
</script>

<div class="flex flex-col items-center gap-1">
	<label for="tuning-select" class="text-xs text-text-secondary">Tuning</label>
	<select
		id="tuning-select"
		value={selectedValue}
		onchange={handleChange}
		aria-label="Select guitar tuning"
		class="rounded-lg border border-border-default bg-bg-surface/50 px-3 py-2 text-sm text-text-primary backdrop-blur-sm transition-colors duration-200 hover:border-accent-amber/30 focus:border-accent-amber/50 focus:outline-none focus:ring-1 focus:ring-accent-amber/30"
		style="min-height: 44px;"
	>
		<option value="auto-detect">Auto-detect (chromatic)</option>
		{#each TUNING_PRESETS as preset (preset.id)}
			<option value={preset.id}>{preset.name} — {preset.description}</option>
		{/each}
	</select>
</div>
