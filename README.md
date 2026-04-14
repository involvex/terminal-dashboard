# @involvex/terminal-dashboard

A modern interactive CLI dashboard built with Ink & React to monitor trending GitHub repositories, npm package releases and system metrics directly from your terminal.

---

## ✨ Features

- 📊 Real-time terminal dashboard interface
- 🔍 Watch trending GitHub repositories
- 📦 Track latest npm package releases
- 💻 System monitoring metrics
- ⌨️ Full keyboard navigation
- 🎨 Clean modern UI with Ink
- 🔥 Hot reload development mode

---

## 🚀 Installation

### Global Installation

```bash
npm install -g @involvex/terminal-dashboard
# or
bun add -g @involvex/terminal-dashboard
```

### Local Development

```bash
git clone https://github.com/involvex/terminal-dashboard.git
cd terminal-dashboard
bun install
```

---

## 💻 Usage

### Run development mode (with hot reload)

```bash
bun run dev
```

### Build for production

```bash
bun run build
```

### Start built version

```bash
bun run start
# or after global install
terminal-dashboard
# or
term-dash
```

---

## 🔧 Available Scripts

| Command             | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `bun run dev`       | Start development server with hot module replacement |
| `bun run build`     | Production build with type checking & linting        |
| `bun run start`     | Run built CLI application                            |
| `bun run format`    | Format all files with Prettier                       |
| `bun run lint`      | Run ESLint checks                                    |
| `bun run lint:fix`  | Fix auto-fixable ESLint errors                       |
| `bun run typecheck` | Run TypeScript type checking                         |

---

## 🛠 Built With

- [Ink](https://github.com/vadimdemedes/ink) - React for CLI interfaces
- React 18
- TypeScript
- Bun
- Prettier + ESLint

---

## 📋 Requirements

- Node.js >= 16
- Bun (recommended) or npm/yarn/pnpm

---

## 📄 License

MIT © involvex

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!
