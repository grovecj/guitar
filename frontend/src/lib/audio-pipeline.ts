export type AudioError = 'permission-denied' | 'no-microphone' | 'not-supported' | 'unknown';

/**
 * Manages the Web Audio API chain: getUserMedia → AudioContext → AnalyserNode.
 * Provides time-domain sample data for pitch detection.
 */
export class AudioPipeline {
	private context: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private source: MediaStreamAudioSourceNode | null = null;
	private stream: MediaStream | null = null;

	get sampleRate(): number {
		return this.context?.sampleRate ?? 44100;
	}

	/**
	 * Request microphone access and build the audio graph.
	 * @throws {{ type: AudioError; message: string }}
	 */
	async initialize(): Promise<void> {
		if (!navigator.mediaDevices?.getUserMedia) {
			throw { type: 'not-supported' as AudioError, message: 'getUserMedia not supported' };
		}

		try {
			this.stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: false
				}
			});
		} catch (err: unknown) {
			throw { type: mapMediaError(err), message: String(err) };
		}

		this.context = new AudioContext();
		this.analyser = this.context.createAnalyser();
		this.analyser.fftSize = 2048;
		this.analyser.smoothingTimeConstant = 0;

		this.source = this.context.createMediaStreamSource(this.stream);
		this.source.connect(this.analyser);
	}

	/** Fill the provided buffer with time-domain samples from the analyser. */
	getTimeDomainData(buffer: Float32Array<ArrayBuffer>): void {
		this.analyser?.getFloatTimeDomainData(buffer);
	}

	/** Tear down everything: stop tracks, disconnect nodes, close context. */
	async cleanup(): Promise<void> {
		this.source?.disconnect();
		this.source = null;

		this.stream?.getTracks().forEach((t) => t.stop());
		this.stream = null;

		this.analyser?.disconnect();
		this.analyser = null;

		if (this.context && this.context.state !== 'closed') {
			await this.context.close();
		}
		this.context = null;
	}
}

function mapMediaError(err: unknown): AudioError {
	if (err instanceof DOMException) {
		switch (err.name) {
			case 'NotAllowedError':
				return 'permission-denied';
			case 'NotFoundError':
				return 'no-microphone';
			case 'NotReadableError':
				return 'no-microphone';
			default:
				return 'unknown';
		}
	}
	return 'unknown';
}
