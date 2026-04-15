#!/usr/bin/env node
import DisplayVersion from './commands/version.js'
import Settings from './commands/settings.js'
import Welcome from './commands/welcome.js'
import About from './commands/about.js'
import Help from './commands/help.js'
import Demo from './commands/demo.js'
import App from './app.js'
import {render} from 'ink'
import meow from 'meow'

const cli = meow(
	`
	Usage
	  $ involvex-terminal-dashboard [command]

	Commands
	  dashboard    Launch the interactive dashboard (default)
	  help        Show this help message
	  version     Show version info
	  about       Show about information
	  welcome     Show welcome screen
	  demo        Show component demo
	  settings    Open settings directly

	Options
	  -v, --version  Show version
	  -h, --help     Show help
	  -d, --debug    Enable debug mode
	  --no-clear     Disable clear on exit

	Examples
	  $ involvex-terminal-dashboard
	  $ involvex-terminal-dashboard help
	  $ involvex-terminal-dashboard --version
	  $ involvex-terminal-dashboard about
	`,
	{
		importMeta: import.meta,
		flags: {
			version: {
				type: 'boolean',
				shortFlag: 'v',
			},
			help: {
				type: 'boolean',
				shortFlag: 'h',
			},
			debug: {
				type: 'boolean',
			},
			noClear: {
				type: 'boolean',
			},
			dashboard: {
				type: 'boolean',
			},
			welcome: {
				type: 'boolean',
			},
			demo: {
				type: 'boolean',
			},
			settings: {
				type: 'boolean',
			},
			about: {
				type: 'boolean',
			},
		},
	},
)

const input = cli.input[0] || ''
const flags = cli.flags

// Map shortcuts
const command =
	input ||
	(flags.help || input === 'help' ? 'help' : '') ||
	(flags.version || input === 'version' ? 'version' : '') ||
	(flags.about || input === 'about' ? 'about' : '') ||
	(flags.welcome || input === 'welcome' ? 'welcome' : '') ||
	(flags.demo || input === 'demo' ? 'demo' : '') ||
	(flags.settings || input === 'settings' ? 'settings' : '') ||
	'' ||
	(flags.dashboard ? 'dashboard' : '')

// Enable debug mode if requested
if (flags.debug) {
	process.env.DEBUG = '1'
}

switch (command) {
	case 'help':
	case 'h':
	case '-h':
	case '--help':
		render(<Help />)
		break
	case 'version':
	case 'v':
	case '-v':
	case '--version':
		render(<DisplayVersion />)
		break
	case 'about':
		render(<About />)
		break
	case 'welcome':
		render(<Welcome />)
		break
	case 'demo':
		render(<Demo />)
		break
	case 'settings':
		render(<Settings />)
		break
	case 'dashboard':
	default:
		render(<App />)
		break
}
