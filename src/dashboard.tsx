import GithubTrendingPanel from './panels/github-trending-panel.js'
import NpmReleasesPanel from './panels/npm-panel.js'
import React, {useState, useEffect} from 'react'
import RamPanel from './panels/ram-panel.js'
import CpuPanel from './panels/cpu-panel.js'
import {Box, Text, useInput} from 'ink'

export default function Dashboard() {
	const [dimensions, setDimensions] = useState({columns: 120, rows: 30})
	const [activePanel, setActivePanel] = useState(0)

	useEffect(() => {
		if (process.stdout.isTTY) {
			setDimensions({
				columns: process.stdout.columns || 120,
				rows: process.stdout.rows || 30,
			})

			const handleResize = () => {
				setDimensions({
					columns: process.stdout.columns || 120,
					rows: process.stdout.rows || 30,
				})
			}

			process.stdout.on('resize', handleResize)
			return () => {
				process.stdout.off('resize', handleResize)
			}
		}
	}, [])

	const {columns, rows} = dimensions

	const panels = [
		{name: 'CPU', component: CpuPanel},
		{name: 'RAM', component: RamPanel},
		{name: 'GitHub', component: GithubTrendingPanel},
		{name: 'NPM', component: NpmReleasesPanel},
	]

	useInput((_input, key) => {
		if (key.tab) {
			setActivePanel(prev => (prev + 1) % panels.length)
		}
		if (key.leftArrow || key.upArrow) {
			setActivePanel(prev => (prev - 1 + panels.length) % panels.length)
		}
		if (key.rightArrow || key.downArrow) {
			setActivePanel(prev => (prev + 1) % panels.length)
		}
		if (key.escape || key.return || _input === 'q' || _input === 'Q') {
			process.exit(0)
		}
	})

	const ActivePanel1 = panels[0].component
	const ActivePanel2 = panels[1].component
	const ActivePanel3 = panels[2].component
	const ActivePanel4 = panels[3].component

	return (
		<Box
			flexDirection="column"
			width={columns}
			height={rows}
			padding={0}
			margin={0}
		>
			{/* Header Bar */}
			<Box
				paddingX={2}
				paddingY={1}
				justifyContent="space-between"
			>
				<Text
					bold
					color="cyan"
				>
					╔═══════ INVOLVEX TERMINAL DASHBOARD ═══════╗
				</Text>
				<Text dimColor>
					{new Date().toLocaleTimeString()} | {columns}x{rows}
				</Text>
			</Box>

			{/* Main Grid Layout */}
			<Box flexDirection="row">
				{/* Left Column */}
				<Box flexDirection="column">
					<ActivePanel1 isActive={activePanel === 0} />
					<ActivePanel2 isActive={activePanel === 1} />
				</Box>

				{/* Right Column */}
				<Box flexDirection="column">
					<ActivePanel3 isActive={activePanel === 2} />
					<ActivePanel4 isActive={activePanel === 3} />
				</Box>
			</Box>

			{/* Footer Bar */}
			<Box
				paddingX={2}
				paddingY={1}
				justifyContent="space-between"
			>
				<Text dimColor>← → ↑ ↓ Navigate Panels • Tab Cycle • Q Quit</Text>
				<Text>
					Active: <Text color="cyan">{panels[activePanel].name}</Text>
				</Text>
			</Box>
		</Box>
	)
}
