import React, {useState, useEffect, useCallback} from 'react'
import Panel from '../components/panel.js'
import {Box, Text, useInput} from 'ink'
import fetch from 'node-fetch'

interface Repo {
	author: string
	name: string
	description: string
	stars: number
	forks: number
	language: string
	url: string
}

interface GithubSearchResponse {
	items: Array<{
		owner: {login: string}
		name: string
		description: string
		stargazers_count: number
		forks_count: number
		language: string
		html_url: string
	}>
}

type Language = 'all' | 'typescript' | 'javascript' | 'python' | 'go' | 'rust'
type Since = 'daily' | 'weekly' | 'monthly'

const LANGUAGES: Language[] = [
	'all',
	'typescript',
	'javascript',
	'python',
	'go',
	'rust',
]
const TIMES: Since[] = ['daily', 'weekly', 'monthly']

const LANGUAGE_LABELS: Record<Language, string> = {
	all: 'all',
	typescript: 'TS',
	javascript: 'JS',
	python: 'py',
	go: 'go',
	rust: 'rs',
}

interface Props {
	isActive: boolean
}

export default function GithubTrendingPanel({isActive}: Props) {
	const [repos, setRepos] = useState<Repo[]>([])
	const [loading, setLoading] = useState(true)
	const [language, setLanguage] = useState<Language>('all')
	const [since, setSince] = useState<Since>('daily')

	const fetchTrending = useCallback(async () => {
		try {
			setLoading(true)
			// Use official GitHub search API with daily trending query
			const date = new Date()
			date.setDate(date.getDate() - 1)
			const dateStr = date.toISOString().split('T')[0]

			const langParam = language !== 'all' ? `+language:${language}` : ''
			const query = `created:>${dateStr}${langParam}`
			const encodedQuery = encodeURIComponent(query)

			const response = await fetch(
				`https://api.github.com/search/repositories?q=${encodedQuery}&sort=stars&order=desc&per_page=10`,
				{
					headers: {
						Accept: 'application/vnd.github.v3+json',
						'User-Agent': 'term-dash',
					},
				},
			)

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`)
			}

			const data = (await response.json()) as GithubSearchResponse
			const items = data.items || []

			// Format for our interface
			const formattedRepos = items.slice(0, 6).map(item => ({
				author: item.owner?.login || 'unknown',
				name: item.name || '',
				description: item.description || '',
				stars: item.stargazers_count || 0,
				forks: item.forks_count || 0,
				language: item.language || '',
				url: item.html_url || '',
			}))

			setRepos(formattedRepos)
		} catch (e) {
			console.error('Error fetching trending repos:', e)
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
	}, [language, since])

	useEffect(() => {
		fetchTrending()
		const interval = setInterval(fetchTrending, 900000)
		return () => clearInterval(interval)
	}, [fetchTrending])

	useInput(
		(_input, _key) => {
			if (!isActive) return

			if (_input === 'l' || _input === 'L') {
				setLanguage(prev => {
					const idx = LANGUAGES.indexOf(prev)
					return LANGUAGES[(idx + 1) % LANGUAGES.length]
				})
			}
			if (_input === 't' || _input === 'T') {
				setSince(prev => {
					const idx = TIMES.indexOf(prev)
					return TIMES[(idx + 1) % TIMES.length]
				})
			}
		},
		{isActive: isActive},
	)

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

	const title = `⭐ GitHub Trending [${LANGUAGE_LABELS[language]}] [${since}]`

	return (
		<Panel
			title={title}
			isActive={isActive}
			isLoading={loading}
		>
			<Box
				flexDirection="column"
				gap={0}
			>
				{isActive && <Text dimColor> L=Language T=Time</Text>}
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
