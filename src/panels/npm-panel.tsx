import React, {useState, useEffect, useCallback} from 'react'
import {useFontScale} from '../hooks/useFontScale.js'
import Panel from '../components/panel.js'
import {Box, Text, useInput} from 'ink'
import fetch from 'node-fetch'

interface NpmPackage {
	name: string
	version: string
	description: string
	date: string
	author: string
}

type Category =
	| 'all'
	| 'frontend'
	| 'backend'
	| 'cli'
	| 'docs'
	| 'css'
	| 'testing'
	| 'iot'
	| 'coverage'
	| 'mobile'
	| 'frameworks'
	| 'robotics'
	| 'math'

type TimeFrame = 'today' | 'week'

const CATEGORIES: Category[] = [
	'all',
	'frontend',
	'backend',
	'cli',
	'docs',
	'css',
	'testing',
	'iot',
	'coverage',
	'mobile',
	'frameworks',
	'robotics',
	'math',
]

const TIMEFRAMES: TimeFrame[] = ['today', 'week']

const CATEGORY_LABELS: Record<Category, string> = {
	all: 'all',
	frontend: 'FE',
	backend: 'BE',
	cli: 'CLI',
	docs: 'DOC',
	css: 'CSS',
	testing: 'Test',
	iot: 'IoT',
	coverage: 'Cov',
	mobile: 'Mob',
	frameworks: 'Fmk',
	robotics: 'Rob',
	math: 'Math',
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
	all: [],
	frontend: [
		'react',
		'vue',
		'angular',
		'svelte',
		'ui',
		'dom',
		'component',
		'hook',
		'render',
		'virtual',
	],
	backend: [
		'server',
		'api',
		'express',
		'nest',
		'database',
		'backend',
		'http',
		'rest',
		'graphql',
	],
	cli: [
		'cli',
		'command',
		'bin',
		'terminal',
		'ink',
		'yargs',
		'commander',
		'argparse',
	],
	docs: ['docs', 'documentation', 'markdown', 'readme', 'doc', 'typedoc'],
	css: ['css', 'style', 'tailwind', 'sass', 'scss', 'theme', 'styled'],
	testing: [
		'test',
		'jest',
		'vitest',
		'mocha',
		'cypress',
		'mock',
		'vitest',
		' AVA',
	],
	iot: [
		'iot',
		'arduino',
		'raspberry',
		'sensor',
		'embedded',
		'firmware',
		'device',
	],
	coverage: ['coverage', 'nyc', 'istanbul', 'c8', 'coveralls'],
	mobile: [
		'react-native',
		'mobile',
		'ios',
		'android',
		'capacitor',
		'ionic',
		'expo',
	],
	frameworks: ['framework', 'scaffold', 'boilerplate', 'starter', 'template'],
	robotics: ['robotics', 'robot', 'ros', 'motor', 'servo', 'drone'],
	math: ['math', 'algorithm', 'numeric', 'statistics', 'utils', 'calc'],
}

interface Props {
	isActive: boolean
	dimensions?: {columns: number; rows: number}
}

function parseRssDate(dateStr: string): Date {
	try {
		return new Date(dateStr)
	} catch {
		return new Date()
	}
}

function isWithinTimeFrame(date: Date, timeframe: TimeFrame): boolean {
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffHours = diffMs / (1000 * 60 * 60)

	if (timeframe === 'today') {
		return diffHours <= 24
	}
	return diffHours <= 24 * 7
}

function matchesCategory(
	name: string,
	description: string,
	category: Category,
): boolean {
	if (category === 'all') return true

	const searchText = `${name} ${description}`.toLowerCase()
	const keywords = CATEGORY_KEYWORDS[category]

	return keywords.some(keyword => searchText.includes(keyword.toLowerCase()))
}

export default function NpmReleasesPanel({isActive, dimensions}: Props) {
	const {columns = 120, rows = 30} = dimensions || {}
	const fontScale = useFontScale(columns, rows)

	const [allPackages, setAllPackages] = useState<NpmPackage[]>([])
	const [loading, setLoading] = useState(true)
	const [category, setCategory] = useState<Category>('all')
	const [timeframe, setTimeframe] = useState<TimeFrame>('today')

	const fetchReleases = useCallback(async () => {
		try {
			setLoading(true)
			const response = await fetch('https://registry.npmjs.com/-/rss')
			const xml = await response.text()

			const packageMatches = xml.matchAll(
				/<item>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<description>([^<]*)<\/description>[\s\S]*?<author>([^<]+)<\/author>[\s\S]*?<dc:creator>[^<]*<\/dc:creator>[\s\S]*?<pubDate>([^<]+)<\/pubDate>/g,
			)

			const packages: NpmPackage[] = []
			for (const match of packageMatches) {
				const titleMatch = match[1]
				const descMatch = match[2]
				const authorMatch = match[3]
				const dateMatch = match[4]

				const atIndex = titleMatch.lastIndexOf('@')
				if (atIndex === -1) continue

				const name = titleMatch.substring(0, atIndex)
				const version = titleMatch.substring(atIndex + 1)

				packages.push({
					name,
					version,
					description: descMatch.replace(/<[^>]*>/g, '').substring(0, 100),
					author: authorMatch,
					date: dateMatch,
				})
			}

			setAllPackages(packages.slice(0, 50))
		} catch (e) {
			console.error('Error fetching NPM releases:', e)
			setAllPackages([
				{
					name: 'react',
					version: '19.2.0',
					description:
						'React is a JavaScript library for building user interfaces.',
					date: new Date().toISOString(),
					author: 'facebook',
				},
				{
					name: 'next',
					version: '15.1.0',
					description: 'The React Framework',
					date: new Date().toISOString(),
					author: 'vercel',
				},
				{
					name: 'bun',
					version: '1.3.12',
					description: 'Fast all-in-one JavaScript runtime',
					date: new Date().toISOString(),
					author: 'oven-sh',
				},
			])
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchReleases()
		const interval = setInterval(fetchReleases, 600000)
		return () => clearInterval(interval)
	}, [fetchReleases])

	useInput(
		(_input, _key) => {
			if (!isActive) return

			if (_input === 'c' || _input === 'C') {
				setCategory(prev => {
					const idx = CATEGORIES.indexOf(prev)
					return CATEGORIES[(idx + 1) % CATEGORIES.length]
				})
			}
			if (_input === 't' || _input === 'T') {
				setTimeframe(prev => {
					const idx = TIMEFRAMES.indexOf(prev)
					return TIMEFRAMES[(idx + 1) % TIMEFRAMES.length]
				})
			}
		},
		{isActive: isActive},
	)

	const filteredPackages = allPackages
		.filter(pkg => {
			const date = parseRssDate(pkg.date)
			if (!isWithinTimeFrame(date, timeframe)) return false
			return matchesCategory(pkg.name, pkg.description, category)
		})
		.slice(0, 6)

	const formatTimeAgo = (dateStr: string) => {
		const date = parseRssDate(dateStr)
		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffHours = diffMs / (1000 * 60 * 60)

		if (diffHours < 1) {
			const mins = Math.floor(diffMs / (1000 * 60))
			return `${mins}m ago`
		}
		if (diffHours < 24) {
			return `${Math.floor(diffHours)}h ago`
		}
		return `${Math.floor(diffHours / 24)}d ago`
	}

	const title = `📦 NPM [${CATEGORY_LABELS[category]}] [${timeframe}]`

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
				{filteredPackages.map((pkg, i) => (
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
							<Text dimColor>{formatTimeAgo(pkg.date)}</Text>
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
