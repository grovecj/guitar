import { writable } from 'svelte/store';
import {
	TUNING_PRESETS,
	findClosestString,
	type GuitarTuning,
	type NoteInfo
} from '$lib/music-theory';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TunerMode = 'auto-detect' | 'guided';

export interface StringStatus {
	inTune: boolean;
	inTuneSince: number | null;
}

export interface TunerModeState {
	mode: TunerMode;
	activeTuning: GuitarTuning;
	stringStatus: StringStatus[];
	currentStringIndex: number | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Cents threshold for considering a string "in tune" */
const IN_TUNE_CENTS = 5;
/** Minimum stability required to count as in-tune */
const IN_TUNE_STABILITY = 0.7;
/** Milliseconds a string must stay in-tune before marking complete */
const IN_TUNE_HOLD_MS = 1000;
/** Minimum ms before switching detected string (debounce) */
const STRING_DEBOUNCE_MS = 150;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

function createInitialState(): TunerModeState {
	return {
		mode: 'guided',
		activeTuning: TUNING_PRESETS[0],
		stringStatus: Array.from({ length: 6 }, () => ({ inTune: false, inTuneSince: null })),
		currentStringIndex: 0
	};
}

export const tunerMode = writable<TunerModeState>(createInitialState());

// ---------------------------------------------------------------------------
// Internal tracking (not in store to avoid re-renders)
// ---------------------------------------------------------------------------

let lastStringChangeTime = 0;
let lastDetectedString: number | null = null;

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export function selectPreset(tuning: GuitarTuning): void {
	lastStringChangeTime = 0;
	lastDetectedString = null;
	tunerMode.set({
		mode: 'guided',
		activeTuning: tuning,
		stringStatus: Array.from({ length: tuning.notes.length }, () => ({
			inTune: false,
			inTuneSince: null
		})),
		currentStringIndex: 0
	});
}

export function selectAutoDetect(): void {
	lastStringChangeTime = 0;
	lastDetectedString = null;
	tunerMode.update((s) => ({
		...s,
		mode: 'auto-detect',
		currentStringIndex: null,
		stringStatus: s.stringStatus.map(() => ({ inTune: false, inTuneSince: null }))
	}));
}

export function resetStrings(): void {
	lastStringChangeTime = 0;
	lastDetectedString = null;
	tunerMode.update((s) => ({
		...s,
		stringStatus: s.stringStatus.map(() => ({ inTune: false, inTuneSince: null })),
		currentStringIndex: 0
	}));
}

export function jumpToString(index: number): void {
	tunerMode.update((s) => {
		if (index < 0 || index >= s.stringStatus.length) return s;
		return { ...s, currentStringIndex: index };
	});
}

// ---------------------------------------------------------------------------
// Guided state updater — called from the tuner page's $effect
// ---------------------------------------------------------------------------

export interface PitchInput {
	note: NoteInfo | null;
	stability: number;
	isDetecting: boolean;
}

export function updateGuidedState(pitch: PitchInput, now: number = Date.now()): void {
	if (!pitch.note || !pitch.isDetecting) return;

	tunerMode.update((state) => {
		if (state.mode !== 'guided') return state;

		const match = findClosestString(pitch.note!, state.activeTuning);
		if (!match) return state;

		const { stringIndex, centsOff } = match;

		// Debounce string switching
		let newCurrentIndex = state.currentStringIndex;
		if (stringIndex !== lastDetectedString) {
			if (now - lastStringChangeTime < STRING_DEBOUNCE_MS) {
				return state;
			}
			lastDetectedString = stringIndex;
			lastStringChangeTime = now;
			newCurrentIndex = stringIndex;
		}

		const newStatus = [...state.stringStatus];
		const entry = { ...newStatus[stringIndex] };

		if (entry.inTune) {
			// Already marked complete — don't change
		} else if (Math.abs(centsOff) <= IN_TUNE_CENTS && pitch.stability >= IN_TUNE_STABILITY) {
			if (entry.inTuneSince === null) {
				entry.inTuneSince = now;
			} else if (now - entry.inTuneSince >= IN_TUNE_HOLD_MS) {
				entry.inTune = true;
				entry.inTuneSince = null;
				// Auto-advance to next un-tuned string
				const nextUntunedIndex = findNextUntuned(newStatus, stringIndex, entry);
				if (nextUntunedIndex !== null) {
					newCurrentIndex = nextUntunedIndex;
				}
			}
		} else {
			// Drifted out of tune — reset timer
			entry.inTuneSince = null;
		}

		newStatus[stringIndex] = entry;

		return {
			...state,
			currentStringIndex: newCurrentIndex,
			stringStatus: newStatus
		};
	});
}

function findNextUntuned(
	status: StringStatus[],
	currentIndex: number,
	updatedCurrent: StringStatus
): number | null {
	// Build a temporary array with the current entry updated
	const tempStatus = [...status];
	tempStatus[currentIndex] = updatedCurrent;

	// Search forward from current, wrapping around
	for (let offset = 1; offset <= tempStatus.length; offset++) {
		const idx = (currentIndex + offset) % tempStatus.length;
		if (!tempStatus[idx].inTune) return idx;
	}
	return null;
}

/** Reset internal debounce state (for testing) */
export function _resetInternals(): void {
	lastStringChangeTime = 0;
	lastDetectedString = null;
}
