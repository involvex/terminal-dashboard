import React, {useState, useEffect} from 'react'
import Panel from '../components/panel.js'
import fetch from 'node-fetch'
import {Box, Text} from 'ink'

interface Repo {
	author: string
	name: string
	description: string
	stars: number
	forks: number
	language: string
	url: string
}

export default function GithubTrendingPanel({isActive}: {isActive: boolean}) {
	const [repos, setRepos] = useState<Repo[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchTrending = async () => {
			try {
				setLoading(true)
				const response = await fetch(
					'https://gh-trending-api.herokuapp.com/repositories',
				)
				const data = (await response.json()) as Repo[]
				setRepos(data.slice(0, 6))
			} catch (e) {
				console.error('Error fetching trending repos:', e)
				// Fallback demo data
				setRepos([
					{
						author: 'facebook',
						name: 'react',
						description: 'A library for web interfaces',
						stars: 220000,
						forks: 45000,
						language: 'JavaScript',
						url: '',
					},
					{
						author: 'vercel',
						name: 'next.js',
						description: 'React Framework',
						stars: 118000,
						forks: 25000,
						language: 'JavaScript',
						url: '',
					},
					{
						author: 'oven-sh',
						name: 'bun',
						description: 'Fast JS runtime',
						stars: 72000,
						forks: 2200,
						language: 'Zig',
						url: '',
					},
				])
			} finally {
				setLoading(false)
			}
		}

		fetchTrending()
		const interval = setInterval(fetchTrending, 300000) // 5 min
		return () => clearInterval(interval)
	}, [])

	const formatNumber = (num: number) => {
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'k'
		}
		return num.toString()
	}

	const getLanguageColor = (lang: string) => {
		const colors: Record<string, string> = {
			JavaScript: 'yellow',
			TypeScript: 'blue',
			Python: 'cyan',
			Rust: 'orange',
			Go: 'cyan',
			Zig: 'yellow',
		}
		return colors[lang] || 'white'
	}

	return (
		<Panel
			title="⭐ GitHub Trending"
			isActive={isActive}
			isLoading={loading}
		>
			<Box
				flexDirection="column"
				gap={1}
			>
				{repos.map((repo, i) => (
					<Box
						key={i}
						flexDirection="column"
						marginBottom={1}
					>
						<Box justifyContent="space-between">
							<Text>
								<Text color="cyan">{repo.author}</Text>
								<Text dimColor> / </Text>
								<Text bold>{repo.name}</Text>
							</Text>
							<Text>
								<Text color="yellow">★ {formatNumber(repo.stars)}</Text>
								<Text dimColor> 🍴 {formatNumber(repo.forks)}</Text>
							</Text>
						</Box>
						<Text
							dimColor
							wrap="truncate-end"
						>
							{repo.description}
						</Text>
						<Text color={getLanguageColor(repo.language)}>{repo.language}</Text>
					</Box>
				))}
			</Box>
		</Panel>
	)
}
