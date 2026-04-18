import Spinner from 'ink-spinner'
import {Box, Text} from 'ink'
import React from 'react'

interface PanelProps {
	title: string
	children: React.ReactNode
	isActive?: boolean
	isLoading?: boolean
	onFocus?: () => void
	width?: number | string
	height?: number | string
}

export default function Panel({
	title,
	children,
	isActive = false,
	isLoading = false,
	width,
	height,
}: PanelProps) {
	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor={isActive ? 'cyan' : 'gray'}
			width={width}
			height={height}
			marginY={0}
			marginX={1}
		>
			<Box
				paddingX={1}
				justifyContent="space-between"
			>
				<Text
					bold
					color={isActive ? 'cyan' : 'white'}
				>
					{title}
				</Text>
				{isLoading && (
					<Text color="yellow">
						<Spinner type="dots" />
					</Text>
				)}
			</Box>

			<Box
				flexDirection="column"
				flexGrow={1}
			>
				{children}
			</Box>
		</Box>
	)
}
