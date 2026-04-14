import React, {useState, useEffect, useCallback} from 'react'
import {useFontScale} from '../hooks/useFontScale.js'
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
	dimensions?: {columns: number; rows: number}
}

export default function GithubTrendingPanel({isActive, dimensions}: Props) {
	const {columns = 120, rows = 30} = dimensions || {}
	const fontScale = useFontScale(columns, rows)

	const [repos, setRepos] = useState<Repo[]>([])
	const [loading, setLoading] = useState(true)
	const [language, setLanguage] = useState<Language>('all')
	const [since, setSince] = useState<Since>('daily')

	const fetchTrending = useCallback(async () => {
		try {
			setLoading(true)
			let url = 'https://gh-trending-api.herokuapp.com/repositories'
			if (language !== 'all') {
				url = `https://gh-trending-api.herokuapp.com/repositories/${language}`
			}
			url += `?since=${since}`

			const response = await fetch(url)
			const data = (await response.json()) as Repo[]
			setRepos(data.slice(0, 6))
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
				gap={fontScale.gap}
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
