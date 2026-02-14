export const NOTE_NAMES = [
	'C',
	'C#',
	'D',
	'D#',
	'E',
	'F',
	'F#',
	'G',
	'G#',
	'A',
	'A#',
	'B'
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export interface NoteInfo {
	name: NoteName;
	octave: number;
	midi: number;
	cents: number;
	frequency: number;
}

/** Standard tuning from low to high: E2 A2 D3 G3 B3 E4 */
export const GUITAR_STANDARD_TUNING: readonly NoteInfo[] = [
	{ name: 'E', octave: 2, midi: 40, cents: 0, frequency: 82.41 },
	{ name: 'A', octave: 2, midi: 45, cents: 0, frequency: 110.0 },
	{ name: 'D', octave: 3, midi: 50, cents: 0, frequency: 146.83 },
	{ name: 'G', octave: 3, midi: 55, cents: 0, frequency: 196.0 },
	{ name: 'B', octave: 3, midi: 59, cents: 0, frequency: 246.94 },
	{ name: 'E', octave: 4, midi: 64, cents: 0, frequency: 329.63 }
];

// ---------------------------------------------------------------------------
// Guitar Tuning Presets
// ---------------------------------------------------------------------------

export interface GuitarTuning {
	id: string;
	name: string;
	description: string;
	notes: readonly NoteInfo[];
}

export const TUNING_PRESETS: readonly GuitarTuning[] = [
	{
		id: 'standard',
		name: 'Standard',
		description: 'Default EADGBE tuning',
		notes: GUITAR_STANDARD_TUNING
	},
	{
		id: 'drop-d',
		name: 'Drop D',
		description: 'Rock & metal essentials',
		notes: [
			{ name: 'D', octave: 2, midi: 38, cents: 0, frequency: 73.42 },
			{ name: 'A', octave: 2, midi: 45, cents: 0, frequency: 110.0 },
			{ name: 'D', octave: 3, midi: 50, cents: 0, frequency: 146.83 },
			{ name: 'G', octave: 3, midi: 55, cents: 0, frequency: 196.0 },
			{ name: 'B', octave: 3, midi: 59, cents: 0, frequency: 246.94 },
			{ name: 'E', octave: 4, midi: 64, cents: 0, frequency: 329.63 }
		]
	},
	{
		id: 'half-step-down',
		name: 'Half-Step Down',
		description: 'Eb tuning — SRV, Hendrix',
		notes: [
			{ name: 'D#', octave: 2, midi: 39, cents: 0, frequency: 77.78 },
			{ name: 'G#', octave: 2, midi: 44, cents: 0, frequency: 103.83 },
			{ name: 'C#', octave: 3, midi: 49, cents: 0, frequency: 138.59 },
			{ name: 'F#', octave: 3, midi: 54, cents: 0, frequency: 185.0 },
			{ name: 'A#', octave: 3, midi: 58, cents: 0, frequency: 233.08 },
			{ name: 'D#', octave: 4, midi: 63, cents: 0, frequency: 311.13 }
		]
	},
	{
		id: 'open-g',
		name: 'Open G',
		description: 'Blues & slide guitar',
		notes: [
			{ name: 'D', octave: 2, midi: 38, cents: 0, frequency: 73.42 },
			{ name: 'G', octave: 2, midi: 43, cents: 0, frequency: 98.0 },
			{ name: 'D', octave: 3, midi: 50, cents: 0, frequency: 146.83 },
			{ name: 'G', octave: 3, midi: 55, cents: 0, frequency: 196.0 },
			{ name: 'B', octave: 3, midi: 59, cents: 0, frequency: 246.94 },
			{ name: 'D', octave: 4, midi: 62, cents: 0, frequency: 293.66 }
		]
	},
	{
		id: 'open-d',
		name: 'Open D',
		description: 'Folk & fingerstyle',
		notes: [
			{ name: 'D', octave: 2, midi: 38, cents: 0, frequency: 73.42 },
			{ name: 'A', octave: 2, midi: 45, cents: 0, frequency: 110.0 },
			{ name: 'D', octave: 3, midi: 50, cents: 0, frequency: 146.83 },
			{ name: 'F#', octave: 3, midi: 54, cents: 0, frequency: 185.0 },
			{ name: 'A', octave: 3, midi: 57, cents: 0, frequency: 220.0 },
			{ name: 'D', octave: 4, midi: 62, cents: 0, frequency: 293.66 }
		]
	},
	{
		id: 'dadgad',
		name: 'DADGAD',
		description: 'Celtic & ambient textures',
		notes: [
			{ name: 'D', octave: 2, midi: 38, cents: 0, frequency: 73.42 },
			{ name: 'A', octave: 2, midi: 45, cents: 0, frequency: 110.0 },
			{ name: 'D', octave: 3, midi: 50, cents: 0, frequency: 146.83 },
			{ name: 'G', octave: 3, midi: 55, cents: 0, frequency: 196.0 },
			{ name: 'A', octave: 3, midi: 57, cents: 0, frequency: 220.0 },
			{ name: 'D', octave: 4, midi: 62, cents: 0, frequency: 293.66 }
		]
	}
] as const;

/**
 * Find the closest string in a tuning for a detected note.
 * Returns null if the detected note is more than 1 semitone from any target.
 */
export function findClosestString(
	detectedNote: NoteInfo,
	tuning: GuitarTuning
): { stringIndex: number; centsOff: number } | null {
	let bestIndex = -1;
	let bestDistance = Infinity;

	for (let i = 0; i < tuning.notes.length; i++) {
		const target = tuning.notes[i];
		const semitoneDiff = detectedNote.midi - target.midi;
		const distance = Math.abs(semitoneDiff * 100 + detectedNote.cents);

		if (distance < bestDistance) {
			bestDistance = distance;
			bestIndex = i;
		}
	}

	// Reject if more than 1 semitone (100 cents) away
	if (bestDistance > 100) return null;

	const target = tuning.notes[bestIndex];
	const centsOff = (detectedNote.midi - target.midi) * 100 + detectedNote.cents;

	return { stringIndex: bestIndex, centsOff };
}

/**
 * Convert a frequency in Hz to the nearest musical note.
 * @param freq - frequency in Hz
 * @param pitchCenter - reference frequency for A4 (default 440)
 */
export function frequencyToNote(freq: number, pitchCenter: number = 440): NoteInfo {
	// MIDI note number (A4 = 69)
	const midiExact = 12 * Math.log2(freq / pitchCenter) + 69;
	const midi = Math.round(midiExact);
	const cents = Math.round((midiExact - midi) * 100);
	const noteIndex = ((midi % 12) + 12) % 12;
	const octave = Math.floor(midi / 12) - 1;
	const name = NOTE_NAMES[noteIndex];
	const frequency = freq;

	return { name, octave, midi, cents, frequency };
}
