#!/usr/bin/env node
import DisplayVersion from './commands/version.js'
import Settings from './commands/settings.js'
import About from './commands/about.js'
import Help from './commands/help.js'
import App from './app.js'
import {render} from 'ink'
import meow from 'meow'

const cli = meow(
	`
  Usage
    $ involvex-terminal-dashboard [command]

  Commands
    dashboard    Launch the interactive dashboard (default)
    help        Show help message
    version     Show version info
    about       Show about information
    settings    Open settings directly

  Options
    -v, --version     Show version
    -h, --help        Show help
    -d, --debug       Enable debug mode
    --no-clear        Disable clear on exit
    --headless        Run without TTY (for CI/automation)

  Examples
    $ involvex-terminal-dashboard
    $ involvex-terminal-dashboard --version
    $ involvex-terminal-dashboard about
    $ involvex-terminal-dashboard --headless
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
			headless: {
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

// Enable headless mode
if (flags.headless) {
	process.env.HEADLESS = '1'
}

// Map shortcuts
const command =
	input ||
	(flags.help || input === 'help' ? 'help' : '') ||
	(flags.version || input === 'version' ? 'version' : '') ||
	(flags.about || input === 'about' ? 'about' : '') ||
	(flags.settings || input === 'settings' ? 'settings' : '') ||
	'' ||
	'dashboard'

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
	case 'settings':
		render(<Settings />)
		break
	case 'dashboard':
	default:
		render(<App />)
		break
}
