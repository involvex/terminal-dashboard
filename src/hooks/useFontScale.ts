export interface FontScale {
	padding: number
	gap: number
	truncateAt: number
	titleSize: number
}

const BASE_COLUMNS = 120
const BASE_ROWS = 30

export function useFontScale(columns: number, rows: number): FontScale {
	const scaleX = Math.max(0.7, Math.min(1.5, columns / BASE_COLUMNS))
	const scaleY = Math.max(0.7, Math.min(1.5, rows / BASE_ROWS))

	return {
		padding: Math.round(1 * scaleX),
		gap: Math.round(1 * Math.min(scaleX, scaleY)),
		truncateAt: Math.round(60 * scaleX),
		titleSize: Math.round(14 * scaleX),
	}
}
