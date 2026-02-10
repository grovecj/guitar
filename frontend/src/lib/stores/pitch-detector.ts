import { writable } from 'svelte/store';
import { frequencyToNote, type NoteInfo } from '$lib/music-theory';
import { YinDetector } from '$lib/yin-algorithm';
import { AudioPipeline, type AudioError } from '$lib/audio-pipeline';
import { SignalProcessor } from '$lib/signal-processor';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PitchDetectorStatus = 'idle' | 'requesting-permission' | 'active' | 'error';

export interface PitchDetectorState {
	status: PitchDetectorStatus;
	error: AudioError | null;
}

export interface PitchDetectionResult {
	frequency: number | null;
	note: NoteInfo | null;
	cents: number;
	confidence: number;
	stability: number;
	isDetecting: boolean;
}

export interface PitchDetectionConfig {
	pitchCenter: number;
	yinThreshold: number;
	silenceThreshold: number;
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

export const PITCH_PRESETS = {
	A440: { pitchCenter: 440, yinThreshold: 0.15, silenceThreshold: 0.01 },
	A432: { pitchCenter: 432, yinThreshold: 0.15, silenceThreshold: 0.01 }
} as const satisfies Record<string, PitchDetectionConfig>;

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------

export const pitchDetectorState = writable<PitchDetectorState>({
	status: 'idle',
	error: null
});

export const pitchDetectionResult = writable<PitchDetectionResult>({
	frequency: null,
	note: null,
	cents: 0,
	confidence: 0,
	stability: 0,
	isDetecting: false
});

export const pitchDetectionConfig = writable<PitchDetectionConfig>({ ...PITCH_PRESETS.A440 });

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

let pipeline: AudioPipeline | null = null;
let detector: YinDetector | null = null;
let processor: SignalProcessor | null = null;
let rafId: number | null = null;
let audioBuffer: Float32Array<ArrayBuffer> | null = null;
let currentConfig: PitchDetectionConfig = { ...PITCH_PRESETS.A440 };
let lastFrameTime = 0;

// Keep config in sync
pitchDetectionConfig.subscribe((c) => (currentConfig = c));

// Target ~30 Hz detection rate
const FRAME_INTERVAL_MS = 1000 / 30;
const BUFFER_SIZE = 2048;

// ---------------------------------------------------------------------------
// Detection loop
// ---------------------------------------------------------------------------

function tick(timestamp: number) {
	rafId = requestAnimationFrame(tick);

	if (timestamp - lastFrameTime < FRAME_INTERVAL_MS) return;
	lastFrameTime = timestamp;

	if (!pipeline || !detector || !processor || !audioBuffer) return;

	pipeline.getTimeDomainData(audioBuffer);
	const raw = detector.detect(audioBuffer);
	const processed = processor.process(raw.frequency, raw.confidence, audioBuffer);

	const note =
		processed.frequency !== null
			? frequencyToNote(processed.frequency, currentConfig.pitchCenter)
			: null;

	pitchDetectionResult.set({
		frequency: processed.frequency,
		note,
		cents: note?.cents ?? 0,
		confidence: processed.confidence,
		stability: processed.stability,
		isDetecting: processed.isDetecting
	});
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function startPitchDetection(): Promise<void> {
	// Already running
	let currentStatus: PitchDetectorStatus | undefined;
	const unsub = pitchDetectorState.subscribe((s) => (currentStatus = s.status));
	unsub();
	if (currentStatus === 'active' || currentStatus === 'requesting-permission') return;

	pitchDetectorState.set({ status: 'requesting-permission', error: null });

	pipeline = new AudioPipeline();

	try {
		await pipeline.initialize();
	} catch (err: unknown) {
		const audioErr = err as { type: AudioError; message: string };
		pitchDetectorState.set({ status: 'error', error: audioErr.type });
		await pipeline.cleanup();
		pipeline = null;
		return;
	}

	detector = new YinDetector(BUFFER_SIZE, {
		sampleRate: pipeline.sampleRate,
		threshold: currentConfig.yinThreshold
	});
	processor = new SignalProcessor(currentConfig.silenceThreshold);
	audioBuffer = new Float32Array(BUFFER_SIZE);
	lastFrameTime = 0;

	pitchDetectorState.set({ status: 'active', error: null });
	rafId = requestAnimationFrame(tick);
}

export async function stopPitchDetection(): Promise<void> {
	if (rafId !== null) {
		cancelAnimationFrame(rafId);
		rafId = null;
	}

	if (pipeline) {
		await pipeline.cleanup();
		pipeline = null;
	}

	detector = null;
	processor?.reset();
	processor = null;
	audioBuffer = null;

	pitchDetectorState.set({ status: 'idle', error: null });
	pitchDetectionResult.set({
		frequency: null,
		note: null,
		cents: 0,
		confidence: 0,
		stability: 0,
		isDetecting: false
	});
}

export function updateConfig(partial: Partial<PitchDetectionConfig>): void {
	pitchDetectionConfig.update((prev) => ({ ...prev, ...partial }));
}
