import React, {useState, useEffect} from 'react'
import Panel from '../components/panel.js'
import si from 'systeminformation'
import {Box, Text} from 'ink'

interface NetworkStats {
	rxSpeed: number
	txSpeed: number
	rxTotal: number
	txTotal: number
}

interface NetworkData {
	current: NetworkStats
	history: number[]
}

const MAX_HISTORY = 40

export default function NetworkPanel({isActive}: {isActive: boolean}) {
	const [data, setData] = useState<NetworkData>({
		current: {rxSpeed: 0, txSpeed: 0, rxTotal: 0, txTotal: 0},
		history: [],
	})

	useEffect(() => {
		let lastRx = 0
		let lastTx = 0

		const fetchData = async () => {
			try {
				const networkStats = await si.networkStats()

				const primary = networkStats[0]
				if (!primary) return

				const rxSpeed = primary.rx_bytes - lastRx
				const txSpeed = primary.tx_bytes - lastTx
				lastRx = primary.rx_bytes
				lastTx = primary.tx_bytes

				setData(prev => {
					const newHistory = [...prev.history, rxSpeed / 1024]
					if (newHistory.length > MAX_HISTORY) {
						newHistory.shift()
					}
					return {
						current: {
							rxSpeed: Math.max(0, rxSpeed),
							txSpeed: Math.max(0, txSpeed),
							rxTotal: primary.rx_bytes,
							txTotal: primary.tx_bytes,
						},
						history: newHistory,
					}
				})
			} catch (e) {
				console.error('Error fetching network data:', e)
			}
		}

		fetchData()
		const interval = setInterval(fetchData, 1000)
		return () => clearInterval(interval)
	}, [])

	const formatSpeed = (bytesPerSec: number): string => {
		if (bytesPerSec < 1024) {
			return `${bytesPerSec.toFixed(0)} B/s`
		}
		if (bytesPerSec < 1024 * 1024) {
			return `${(bytesPerSec / 1024).toFixed(1)} KiB/s`
		}
		return `${(bytesPerSec / 1024 / 1024).toFixed(2)} MiB/s`
	}

	const formatBytes = (bytes: number): string => {
		const gb = bytes / (1024 * 1024 * 1024)
		if (gb >= 1) {
			return `${gb.toFixed(2)} GiB`
		}
		const mb = bytes / (1024 * 1024)
		if (mb >= 1) {
			return `${mb.toFixed(1)} MiB`
		}
		const kb = bytes / 1024
		return `${kb.toFixed(1)} KiB`
	}

	const renderGraph = (history: number[], width: number) => {
		if (history.length < 2) {
			return <Text dimColor>{'─'.repeat(width)}</Text>
		}

		const max = Math.max(...history, 1024)

		let result = ''
		for (let i = 0; i < width; i++) {
			const idx = Math.floor((i / width) * (history.length - 1))
			const value = history[idx]
			const ratio = value / max

			if (ratio > 0.8) {
				result += '█'
			} else if (ratio > 0.6) {
				result += '▓'
			} else if (ratio > 0.4) {
				result += '▒'
			} else if (ratio > 0.2) {
				result += '░'
			} else {
				result += '─'
			}
		}

		return <Text color="green">{result}</Text>
	}

	return (
		<Panel
			title="🌐 Network"
			isActive={isActive}
		>
			<Box flexDirection="column">
				<Box
					flexDirection="row"
					justifyContent="space-between"
				>
					<Box flexDirection="column">
						<Text>
							<Text dimColor>Download: </Text>
							<Text color="cyan">{formatSpeed(data.current.rxSpeed)}</Text>
						</Text>
						<Text dimColor>Total: {formatBytes(data.current.rxTotal)}</Text>
					</Box>
					<Box
						flexDirection="column"
						alignItems="flex-end"
					>
						<Text>
							<Text dimColor>Upload: </Text>
							<Text color="magenta">{formatSpeed(data.current.txSpeed)}</Text>
						</Text>
						<Text dimColor>Total: {formatBytes(data.current.txTotal)}</Text>
					</Box>
				</Box>

				<Box marginTop={1}>{renderGraph(data.history, 50)}</Box>

				<Box
					marginTop={1}
					justifyContent="space-between"
				>
					<Text dimColor>↓ download</Text>
					<Text dimColor>↑ upload</Text>
				</Box>
			</Box>
		</Panel>
	)
}
