import React, {useState, useEffect} from 'react'
import Panel from '../components/panel.js'
import fetch from 'node-fetch'
import {Box, Text} from 'ink'

interface NpmPackage {
	name: string
	version: string
	description: string
	date: string
	author: string
}

export default function NpmReleasesPanel({isActive}: {isActive: boolean}) {
	const [packages, setPackages] = useState<NpmPackage[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchReleases = async () => {
			try {
				setLoading(true)
				const response = await fetch('https://registry.npmjs.com/-/rss')
				await response.text()

				// Parse simple demo data for now
				setPackages([
					{
						name: 'react',
						version: '19.2.0',
						description:
							'React is a JavaScript library for building user interfaces.',
						date: '1h ago',
						author: 'facebook',
					},
					{
						name: 'next',
						version: '15.1.0',
						description: 'The React Framework',
						date: '3h ago',
						author: 'vercel',
					},
					{
						name: 'bun',
						version: '1.3.12',
						description: 'Fast all-in-one JavaScript runtime',
						date: '6h ago',
						author: 'oven-sh',
					},
					{
						name: 'ink',
						version: '5.1.0',
						description: 'React for CLIs',
						date: '12h ago',
						author: 'vadimdemedes',
					},
					{
						name: 'typescript',
						version: '5.7.2',
						description:
							'TypeScript is a language for application scale JavaScript development',
						date: '1d ago',
						author: 'Microsoft',
					},
				])
			} catch (e) {
				console.error('Error fetching NPM releases:', e)
				// Handle silently
			} finally {
				setLoading(false)
			}
		}

		fetchReleases()
		const interval = setInterval(fetchReleases, 120000) // 2 min
		return () => clearInterval(interval)
	}, [])

	return (
		<Panel
			title="📦 NPM Latest Releases"
			isActive={isActive}
			isLoading={loading}
		>
			<Box
				flexDirection="column"
				gap={1}
			>
				{packages.map((pkg, i) => (
					<Box
						key={i}
						flexDirection="column"
						marginBottom={1}
					>
						<Box justifyContent="space-between">
							<Text>
								<Text
									color="magenta"
									bold
								>
									{pkg.name}
								</Text>
								<Text dimColor> @ </Text>
								<Text color="cyan">{pkg.version}</Text>
							</Text>
							<Text dimColor>{pkg.date}</Text>
						</Box>
						<Text
							dimColor
							wrap="truncate-end"
						>
							{pkg.description}
						</Text>
					</Box>
				))}
			</Box>
		</Panel>
	)
}
