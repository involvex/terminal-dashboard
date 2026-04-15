import React, {useState, useEffect} from 'react'
import Panel from '../components/panel.js'
import si from 'systeminformation'
import {Box, Text} from 'ink'

interface SystemData {
	cpuUsage: number
	cores: number[]
	ramUsage: number
	ramUsed: number
	ramTotal: number
	ramFree: number
}

export default function SystemPanel({isActive}: {isActive: boolean}) {
	const [data, setData] = useState<SystemData>({
		cpuUsage: 0,
		cores: [],
		ramUsage: 0,
		ramUsed: 0,
		ramTotal: 0,
		ramFree: 0,
	})

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [currentLoad, mem] = await Promise.all([
					si.currentLoad(),
					si.mem(),
				])

				setData({
					cpuUsage: Math.round(currentLoad.currentLoad),
					cores: currentLoad.cpus.map(c => Math.round(c.load)),
					ramUsage: Math.round((mem.used / mem.total) * 100),
					ramUsed: mem.used,
					ramTotal: mem.total,
					ramFree: mem.free,
				})
			} catch (e) {
				console.error('Error fetching system data:', e)
			}
		}

		fetchData()
		const interval = setInterval(fetchData, 1000)
		return () => clearInterval(interval)
	}, [])

	const formatGb = (bytes: number) => {
		const gb = bytes / (1024 * 1024 * 1024)
		return `${gb.toFixed(1)} GB`
	}

	const renderBar = (value: number, width: number) => {
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

	const formatCore = (idx: number, load: number) => {
		const color = load > 80 ? 'red' : load > 50 ? 'yellow' : 'green'
		return (
			<Text key={idx}>
				<Text dimColor>{`${idx + 1}:`}</Text>
				<Text color={color}>{`${load}%`}</Text>
				<Text dimColor> </Text>
			</Text>
		)
	}

	return (
		<Panel
			title="🖥 System"
			isActive={isActive}
		>
			<Box
				flexDirection="row"
				gap={2}
			>
				{/* CPU Section */}
				<Box
					flexDirection="column"
					flexGrow={1}
				>
					<Box justifyContent="space-between">
						<Text>
							<Text bold>CPU </Text>
							{renderBar(data.cpuUsage, 16)}
							<Text> {data.cpuUsage}%</Text>
						</Text>
					</Box>
					<Box marginTop={1}>
						{data.cores.slice(0, 4).map((core, i) => formatCore(i, core))}
						{data.cores.length > 4 && (
							<Text dimColor>+{data.cores.length - 4}</Text>
						)}
					</Box>
				</Box>

				{/* RAM Section */}
				<Box
					flexDirection="column"
					flexGrow={1}
				>
					<Box justifyContent="space-between">
						<Text>
							<Text bold>RAM </Text>
							{renderBar(data.ramUsage, 16)}
							<Text> {data.ramUsage}%</Text>
						</Text>
					</Box>
					<Box
						marginTop={1}
						flexDirection="column"
					>
						<Text>
							Used: <Text color="yellow">{formatGb(data.ramUsed)}</Text>
							<Text dimColor> / {formatGb(data.ramTotal)}</Text>
						</Text>
						<Text>
							Free: <Text color="green">{formatGb(data.ramFree)}</Text>
						</Text>
					</Box>
				</Box>
			</Box>
		</Panel>
	)
}
