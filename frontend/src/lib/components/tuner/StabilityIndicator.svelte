<script lang="ts">
	interface Props {
		stability: number;
		isDetecting: boolean;
		reducedMotion: boolean;
	}

	let { stability, isDetecting, reducedMotion }: Props = $props();

	let fillPercent = $derived(isDetecting ? Math.round(stability * 100) : 0);
	let barColor = $derived(
		stability > 0.7 ? 'bg-accent-green' : stability > 0.3 ? 'bg-accent-amber' : 'bg-accent-red'
	);
</script>

<div
	class="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated"
	role="meter"
	aria-valuenow={fillPercent}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-label="Signal stability"
>
	<div
		class="h-full rounded-full {barColor}"
		style="width: {fillPercent}%; transition: width {reducedMotion
			? '0ms'
			: '300ms'} ease, background-color {reducedMotion ? '0ms' : '300ms'} ease;"
	></div>
</div>
