import React, {useState, useEffect} from 'react'
import {Box, Text, useInput} from 'ink'
import {useAppContext} from './app.js'

export default function Dashboard() {
	const {plugins, setScreen} = useAppContext()
	const [dimensions, setDimensions] = useState({columns: 120, rows: 30})
	const [activePanel, setActivePanel] = useState(0)
	const [currentTime, setCurrentTime] = useState(new Date())

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date())
		}, 1000)
		return () => clearInterval(timer)
	}, [])

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

	const enabledPanels = plugins.filter(p => p.enabled)

	useInput((_input, key) => {
		if (enabledPanels.length === 0) return

		if (key.tab) {
			setActivePanel(prev => (prev + 1) % enabledPanels.length)
		}
		if (key.leftArrow || key.upArrow) {
			setActivePanel(
				prev => (prev - 1 + enabledPanels.length) % enabledPanels.length,
			)
		}
		if (key.rightArrow || key.downArrow) {
			setActivePanel(prev => (prev + 1) % enabledPanels.length)
		}
		if (_input === 'm' || _input === 'M') {
			setScreen('menu')
		}
		if (key.escape || _input === 'q' || _input === 'Q') {
			process.exit(0)
		}
	})

	const {columns, rows} = dimensions

	const renderGrid = () => {
		if (enabledPanels.length === 0) {
			return (
				<Box
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					flexGrow={1}
				>
					<Text dimColor>
						No panels enabled. Go to Settings to enable panels.
					</Text>
				</Box>
			)
		}

		// Separate system panel (full-width top) from content panels
		const systemPanel = enabledPanels.find(p => p.id === 'system')
		const contentPanels = enabledPanels.filter(p => p.id !== 'system')

		// Calculate active panel index mapping
		let globalIndex = 0
		const systemIndex = systemPanel ? globalIndex++ : -1
		const contentIndices = contentPanels.map(() => globalIndex++)

		// Render a panel with the correct active state
		const renderPanel = (
			panel: (typeof enabledPanels)[number],
			idx: number,
		) => {
			const PanelComponent = panel.component
			return (
				<PanelComponent
					key={panel.id}
					isActive={activePanel === idx}
					dimensions={dimensions}
				/>
			)
		}

		// If only content panels (no system), use two-column layout
		if (!systemPanel) {
			const half = Math.ceil(contentPanels.length / 2)
			const leftPanels = contentPanels.slice(0, half)
			const rightPanels = contentPanels.slice(half)

			return (
				<Box
					flexDirection="row"
					flexGrow={1}
				>
					<Box
						flexDirection="column"
						width="50%"
					>
						{leftPanels.map((panel, i) =>
							renderPanel(panel, contentIndices[i]),
						)}
					</Box>
					<Box
						flexDirection="column"
						width="50%"
					>
						{rightPanels.map((panel, i) =>
							renderPanel(panel, contentIndices[half + i]),
						)}
					</Box>
				</Box>
			)
		}

		// If only system panel, render it full-width
		if (contentPanels.length === 0) {
			return (
				<Box
					flexDirection="column"
					flexGrow={1}
				>
					{renderPanel(systemPanel, systemIndex)}
				</Box>
			)
		}

		// Full layout: system bar at top + two-column content below
		const half = Math.ceil(contentPanels.length / 2)
		const leftPanels = contentPanels.slice(0, half)
		const rightPanels = contentPanels.slice(half)

		return (
			<Box
				flexDirection="column"
				flexGrow={1}
			>
				{/* Full-width system bar at top */}
				{renderPanel(systemPanel, systemIndex)}

				{/* Two-column content area */}
				<Box
					flexDirection="row"
					flexGrow={1}
				>
					<Box
						flexDirection="column"
						width="50%"
					>
						{leftPanels.map((panel, i) =>
							renderPanel(panel, contentIndices[i]),
						)}
					</Box>
					<Box
						flexDirection="column"
						width="50%"
					>
						{rightPanels.map((panel, i) =>
							renderPanel(panel, contentIndices[half + i]),
						)}
					</Box>
				</Box>
			</Box>
		)
	}

	const activePanelHints = enabledPanels[activePanel]?.keyHints

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
				borderStyle="single"
				borderBottom={true}
				borderTop={false}
				borderLeft={false}
				borderRight={false}
				borderColor="cyan"
			>
				<Text
					bold
					color="cyan"
				>
					INVOLVEX TERMINAL DASHBOARD
				</Text>
				<Text>
					<Text
						color="yellow"
						bold
					>
						{currentTime.toLocaleDateString()}
					</Text>
					<Text dimColor> | </Text>
					<Text
						color="green"
						bold
					>
						{currentTime.toLocaleTimeString()}
					</Text>
					<Text dimColor>
						{' '}
						| {columns}x{rows}
					</Text>
				</Text>
			</Box>

			{/* Main Grid Layout */}
			{renderGrid()}

			{/* Footer Bar */}
			<Box
				paddingX={2}
				paddingY={1}
				justifyContent="space-between"
				borderStyle="single"
				borderTop={true}
				borderBottom={false}
				borderLeft={false}
				borderRight={false}
				borderColor="cyan"
			>
				<Box flexDirection="column">
					<Text dimColor>
						← → ↑ ↓ Navigate • Tab Cycle • M Menu • Ctrl+G Git • Ctrl+P Tasks •
						Q Quit
					</Text>
					{activePanelHints && <Text color="yellow">{activePanelHints}</Text>}
				</Box>
				<Text>
					Active:{' '}
					<Text color="cyan">{enabledPanels[activePanel]?.name || 'None'}</Text>
				</Text>
			</Box>
		</Box>
	)
}
