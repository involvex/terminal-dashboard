import React, {useState, useEffect} from 'react'
import Panel from '../components/panel.js'
import si from 'systeminformation'
import {Box, Text} from 'ink'

interface RamData {
	total: number
	used: number
	free: number
	buffers: number
	cached: number
	usage: number
}

export default function RamPanel({isActive}: {isActive: boolean}) {
	const [ram, setRam] = useState<RamData>({
		total: 0,
		used: 0,
		free: 0,
		buffers: 0,
		cached: 0,
		usage: 0,
	})

	useEffect(() => {
		const fetchRam = async () => {
			try {
				const mem = await si.mem()

				setRam({
					total: mem.total,
					used: mem.used,
					free: mem.free,
					buffers: mem.buffers,
					cached: mem.cached,
					usage: Math.round((mem.used / mem.total) * 100),
				})
			} catch (e) {
				console.error('Error fetching RAM data:', e)
				// Handle silently
			}
		}

		fetchRam()
		const interval = setInterval(fetchRam, 1000)
		return () => clearInterval(interval)
	}, [])

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 GB'
		const gb = bytes / (1024 * 1024 * 1024)
		return `${gb.toFixed(1)} GB`
	}

	const renderBar = (value: number) => {
		const width = 40
		const filled = Math.round((value / 100) * width)
		const empty = width - filled
		const color = value > 80 ? 'red' : value > 50 ? 'yellow' : 'green'

		return (
			<Text>
				<Text color={color}>{'█'.repeat(filled)}</Text>
				<Text dimColor>{'░'.repeat(empty)}</Text>
			</Text>
		)
	}

	return (
		<Panel
			title="💾 Memory Usage"
			isActive={isActive}
		>
			<Box
				flexDirection="column"
				gap={1}
			>
				<Box>
					{renderBar(ram.usage)}
					<Text> {ram.usage}%</Text>
				</Box>

				<Box
					flexDirection="column"
					gap={0}
					marginTop={1}
				>
					<Text>
						Total: <Text color="cyan">{formatBytes(ram.total)}</Text>
					</Text>
					<Text>
						Used: <Text color="yellow">{formatBytes(ram.used)}</Text>
					</Text>
					<Text>
						Free: <Text color="green">{formatBytes(ram.free)}</Text>
					</Text>
					<Text>
						Buffers: <Text dimColor>{formatBytes(ram.buffers)}</Text>
					</Text>
					<Text>
						Cached: <Text dimColor>{formatBytes(ram.cached)}</Text>
					</Text>
				</Box>
			</Box>
		</Panel>
	)
}
