/** Frequency bounds for guitar range: E2 to E5 */
const MIN_FREQUENCY = 82;
const MAX_FREQUENCY = 660;
const MEDIAN_WINDOW = 11;

export interface ProcessedSignal {
	frequency: number | null;
	confidence: number;
	isDetecting: boolean;
	stability: number;
}

/**
 * Post-processes raw pitch detections: silence gating, median filtering,
 * frequency clamping, and stability estimation.
 */
export class SignalProcessor {
	private history: number[] = [];
	private silenceThreshold: number;

	constructor(silenceThreshold: number = 0.01) {
		this.silenceThreshold = silenceThreshold;
	}

	/** Compute RMS amplitude of a buffer. */
	rms(buffer: Float32Array): number {
		let sum = 0;
		for (let i = 0; i < buffer.length; i++) {
			sum += buffer[i] * buffer[i];
		}
		return Math.sqrt(sum / buffer.length);
	}

	/**
	 * Process a raw detection result through the smoothing pipeline.
	 * @param rawFrequency - frequency from YIN (null if undetected)
	 * @param confidence - YIN confidence 0–1
	 * @param buffer - raw audio samples for RMS check
	 */
	process(rawFrequency: number | null, confidence: number, buffer: Float32Array): ProcessedSignal {
		// Silence gate
		if (this.rms(buffer) < this.silenceThreshold) {
			this.history = [];
			return { frequency: null, confidence: 0, isDetecting: false, stability: 0 };
		}

		// No detection
		if (rawFrequency === null || confidence < 0.5) {
			this.history = [];
			return { frequency: null, confidence, isDetecting: false, stability: 0 };
		}

		// Clamp to guitar range
		if (rawFrequency < MIN_FREQUENCY || rawFrequency > MAX_FREQUENCY) {
			return { frequency: null, confidence, isDetecting: false, stability: 0 };
		}

		// Add to history for median filter
		this.history.push(rawFrequency);
		if (this.history.length > MEDIAN_WINDOW) {
			this.history.shift();
		}

		const frequency = this.median(this.history);
		const stability = this.computeStability();

		return { frequency, confidence, isDetecting: true, stability };
	}

	/** Reset internal state. */
	reset() {
		this.history = [];
	}

	private median(values: number[]): number {
		const sorted = [...values].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
	}

	/** Stability 0–1 based on variance of recent detections (lower variance → higher stability). */
	private computeStability(): number {
		if (this.history.length < 3) return 0;

		const mean = this.history.reduce((s, v) => s + v, 0) / this.history.length;
		const variance = this.history.reduce((s, v) => s + (v - mean) ** 2, 0) / this.history.length;
		// Normalize: variance of ~100 cents (~6% freq) → stability ~0
		const normalizedVariance = variance / (mean * mean);
		return Math.max(0, Math.min(1, 1 - normalizedVariance * 500));
	}
}
