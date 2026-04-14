import React, {useState, useEffect} from 'react'
import Panel from '../components/panel.js'
import si from 'systeminformation'
import {Box, Text} from 'ink'

interface CpuData {
	usage: number
	cores: number[]
	speed: number
	temp: number
}

export default function CpuPanel({isActive}: {isActive: boolean}) {
	const [cpu, setCpu] = useState<CpuData>({
		usage: 0,
		cores: [],
		speed: 0,
		temp: 0,
	})

	useEffect(() => {
		const fetchCpu = async () => {
			try {
				const [currentLoad, cpuTemp] = await Promise.all([
					si.currentLoad(),
					si.cpuTemperature(),
				])

				setCpu({
					usage: Math.round(currentLoad.currentLoad),
					cores: currentLoad.cpus.map(c => Math.round(c.load)),
					speed: Math.round(cpuTemp.max),
					temp: Math.round(cpuTemp.main || 0),
				})
			} catch (e) {
				console.error('Error fetching CPU data:', e)
				// Handle silently
			}
		}

		fetchCpu()
		const interval = setInterval(fetchCpu, 1000)
		return () => clearInterval(interval)
	}, [])

	const renderBar = (value: number) => {
		const width = 20
		const filled = Math.round((value / 100) * width)
		const empty = width - filled
		const color = value > 80 ? 'red' : value > 50 ? 'yellow' : 'green'

		return (
			<Text>
				<Text color={color}>{'█'.repeat(filled)}</Text>
				<Text dimColor>{'░'.repeat(empty)}</Text>
				<Text> {value.toString().padStart(3)}%</Text>
			</Text>
		)
	}

	return (
		<Panel
			title="📊 CPU Usage"
			isActive={isActive}
		>
			<Box
				flexDirection="column"
				gap={1}
			>
				<Box justifyContent="space-between">
					<Text>Total Usage:</Text>
					{renderBar(cpu.usage)}
				</Box>

				<Box
					flexDirection="column"
					gap={0}
				>
					<Text dimColor>Cores:</Text>
					{cpu.cores.slice(0, 8).map((core, i) => (
						<Text key={i}>
							<Text dimColor>{`  ${(i + 1).toString().padStart(2)}: `}</Text>
							{renderBar(core)}
						</Text>
					))}
				</Box>

				<Box
					marginTop={1}
					justifyContent="space-between"
				>
					<Text dimColor>Temperature: {cpu.temp}°C</Text>
				</Box>
			</Box>
		</Panel>
	)
}
