import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
	tunerMode,
	selectPreset,
	selectAutoDetect,
	resetStrings,
	jumpToString,
	updateGuidedState,
	_resetInternals,
	type PitchInput
} from './tuner-mode';
import { TUNING_PRESETS } from '$lib/music-theory';

function getState() {
	return get(tunerMode);
}

describe('tuner-mode store', () => {
	beforeEach(() => {
		selectPreset(TUNING_PRESETS[0]); // Reset to Standard
		_resetInternals();
	});

	describe('initial state', () => {
		it('defaults to guided mode with Standard tuning', () => {
			const s = getState();
			expect(s.mode).toBe('guided');
			expect(s.activeTuning.id).toBe('standard');
			expect(s.currentStringIndex).toBe(0);
		});

		it('has 6 strings all not in tune', () => {
			const s = getState();
			expect(s.stringStatus).toHaveLength(6);
			for (const status of s.stringStatus) {
				expect(status.inTune).toBe(false);
				expect(status.inTuneSince).toBeNull();
			}
		});
	});

	describe('selectPreset', () => {
		it('changes tuning and resets string status', () => {
			const dropD = TUNING_PRESETS.find((p) => p.id === 'drop-d')!;
			selectPreset(dropD);
			const s = getState();
			expect(s.activeTuning.id).toBe('drop-d');
			expect(s.mode).toBe('guided');
			expect(s.currentStringIndex).toBe(0);
			expect(s.stringStatus.every((st) => !st.inTune)).toBe(true);
		});
	});

	describe('selectAutoDetect', () => {
		it('switches to auto-detect mode', () => {
			selectAutoDetect();
			const s = getState();
			expect(s.mode).toBe('auto-detect');
			expect(s.currentStringIndex).toBeNull();
		});
	});

	describe('resetStrings', () => {
		it('clears all string status and resets to string 0', () => {
			jumpToString(3);
			resetStrings();
			const s = getState();
			expect(s.currentStringIndex).toBe(0);
			expect(s.stringStatus.every((st) => !st.inTune)).toBe(true);
		});
	});

	describe('jumpToString', () => {
		it('sets current string index', () => {
			jumpToString(4);
			expect(getState().currentStringIndex).toBe(4);
		});

		it('ignores out-of-range index', () => {
			jumpToString(4);
			jumpToString(10);
			expect(getState().currentStringIndex).toBe(4);
		});

		it('ignores negative index', () => {
			jumpToString(2);
			jumpToString(-1);
			expect(getState().currentStringIndex).toBe(2);
		});
	});

	describe('updateGuidedState', () => {
		it('ignores updates when not detecting', () => {
			const pitch: PitchInput = {
				note: { name: 'E', octave: 2, midi: 40, cents: 0, frequency: 82.41 },
				stability: 0.9,
				isDetecting: false
			};
			updateGuidedState(pitch, 1000);
			expect(getState().currentStringIndex).toBe(0);
		});

		it('ignores updates when note is null', () => {
			const pitch: PitchInput = { note: null, stability: 0.9, isDetecting: true };
			updateGuidedState(pitch, 1000);
			expect(getState().currentStringIndex).toBe(0);
		});

		it('ignores updates in auto-detect mode', () => {
			selectAutoDetect();
			const pitch: PitchInput = {
				note: { name: 'E', octave: 2, midi: 40, cents: 0, frequency: 82.41 },
				stability: 0.9,
				isDetecting: true
			};
			updateGuidedState(pitch, 1000);
			expect(getState().currentStringIndex).toBeNull();
		});

		it('detects current string from pitch', () => {
			const pitch: PitchInput = {
				note: { name: 'A', octave: 2, midi: 45, cents: 3, frequency: 110.2 },
				stability: 0.5,
				isDetecting: true
			};
			updateGuidedState(pitch, 1000);
			expect(getState().currentStringIndex).toBe(1);
		});

		it('marks string in-tune after sustained hold', () => {
			const pitch: PitchInput = {
				note: { name: 'E', octave: 2, midi: 40, cents: 2, frequency: 82.5 },
				stability: 0.9,
				isDetecting: true
			};

			// Start tracking
			updateGuidedState(pitch, 1000);
			expect(getState().stringStatus[0].inTune).toBe(false);
			expect(getState().stringStatus[0].inTuneSince).toBe(1000);

			// Still in tune at 999ms — not yet
			updateGuidedState(pitch, 1999);
			expect(getState().stringStatus[0].inTune).toBe(false);

			// Hit 1000ms — should mark complete
			updateGuidedState(pitch, 2000);
			expect(getState().stringStatus[0].inTune).toBe(true);
		});

		it('resets timer when pitch drifts out of tune', () => {
			const inTune: PitchInput = {
				note: { name: 'E', octave: 2, midi: 40, cents: 2, frequency: 82.5 },
				stability: 0.9,
				isDetecting: true
			};
			const outOfTune: PitchInput = {
				note: { name: 'E', octave: 2, midi: 40, cents: 20, frequency: 83.5 },
				stability: 0.9,
				isDetecting: true
			};

			updateGuidedState(inTune, 1000);
			expect(getState().stringStatus[0].inTuneSince).toBe(1000);

			updateGuidedState(outOfTune, 1500);
			expect(getState().stringStatus[0].inTuneSince).toBeNull();
		});

		it('auto-advances to next un-tuned string after marking complete', () => {
			const pitch: PitchInput = {
				note: { name: 'E', octave: 2, midi: 40, cents: 0, frequency: 82.41 },
				stability: 0.9,
				isDetecting: true
			};

			updateGuidedState(pitch, 1000);
			updateGuidedState(pitch, 2000);

			const s = getState();
			expect(s.stringStatus[0].inTune).toBe(true);
			expect(s.currentStringIndex).toBe(1); // Advanced to string 1
		});

		it('resets timer when stability is too low', () => {
			const lowStability: PitchInput = {
				note: { name: 'E', octave: 2, midi: 40, cents: 2, frequency: 82.5 },
				stability: 0.3,
				isDetecting: true
			};
			const highStability: PitchInput = {
				note: { name: 'E', octave: 2, midi: 40, cents: 2, frequency: 82.5 },
				stability: 0.9,
				isDetecting: true
			};

			updateGuidedState(highStability, 1000);
			expect(getState().stringStatus[0].inTuneSince).toBe(1000);

			updateGuidedState(lowStability, 1200);
			expect(getState().stringStatus[0].inTuneSince).toBeNull();
		});
	});
});
