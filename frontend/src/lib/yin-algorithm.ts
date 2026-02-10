export interface YinConfig {
	sampleRate: number;
	threshold: number;
	minFrequency: number;
	maxFrequency: number;
}

export interface YinResult {
	frequency: number | null;
	confidence: number;
}

const DEFAULT_CONFIG: YinConfig = {
	sampleRate: 44100,
	threshold: 0.15,
	minFrequency: 70,
	maxFrequency: 700
};

/**
 * YIN pitch detection algorithm.
 *
 * Operates on a Float32Array of audio samples and returns the detected
 * fundamental frequency with a confidence value.
 *
 * Pre-allocates internal buffers and reuses them across calls for performance.
 */
export class YinDetector {
	private config: YinConfig;
	private halfBufferSize: number;
	private yinBuffer: Float32Array;

	constructor(bufferSize: number, config: Partial<YinConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.halfBufferSize = Math.floor(bufferSize / 2);
		this.yinBuffer = new Float32Array(this.halfBufferSize);
	}

	detect(buffer: Float32Array): YinResult {
		const { sampleRate, threshold, minFrequency, maxFrequency } = this.config;
		const halfSize = this.halfBufferSize;
		const yinBuf = this.yinBuffer;

		const tauMin = Math.floor(sampleRate / maxFrequency);
		const tauMax = Math.min(Math.ceil(sampleRate / minFrequency), halfSize);

		// Step 1: Difference function
		for (let tau = 0; tau < halfSize; tau++) {
			yinBuf[tau] = 0;
		}
		for (let tau = tauMin; tau < tauMax; tau++) {
			let sum = 0;
			for (let i = 0; i < halfSize; i++) {
				const delta = buffer[i] - buffer[i + tau];
				sum += delta * delta;
			}
			yinBuf[tau] = sum;
		}

		// Step 2: Cumulative mean normalized difference
		yinBuf[0] = 1;
		let runningSum = 0;
		for (let tau = 1; tau < tauMax; tau++) {
			runningSum += yinBuf[tau];
			yinBuf[tau] = runningSum === 0 ? 1 : (yinBuf[tau] * tau) / runningSum;
		}

		// Step 3: Absolute threshold — find first dip below threshold
		let tauEstimate = -1;
		for (let tau = tauMin; tau < tauMax; tau++) {
			if (yinBuf[tau] < threshold) {
				// Walk to local minimum
				while (tau + 1 < tauMax && yinBuf[tau + 1] < yinBuf[tau]) {
					tau++;
				}
				tauEstimate = tau;
				break;
			}
		}

		if (tauEstimate === -1) {
			return { frequency: null, confidence: 0 };
		}

		// Step 4: Parabolic interpolation for sub-sample accuracy
		const confidence = 1 - yinBuf[tauEstimate];
		let betterTau: number;

		if (tauEstimate > 0 && tauEstimate < halfSize - 1) {
			const s0 = yinBuf[tauEstimate - 1];
			const s1 = yinBuf[tauEstimate];
			const s2 = yinBuf[tauEstimate + 1];
			const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
			betterTau = tauEstimate + (isFinite(adjustment) ? adjustment : 0);
		} else {
			betterTau = tauEstimate;
		}

		const frequency = sampleRate / betterTau;
		return { frequency, confidence };
	}
}
