# Tavern Code CLI

The AI coding agent built for the terminal. Generate code from natural language, automate tasks, and run terminal commands -- powered by 500+ AI models.

![Tavern CLI showing code edits in a terminal](https://raw.githubusercontent.com/Kilo-Org/kilocode/main/packages/tavern-docs/public/img/npm-package-readme/tavern-cli.png)

Tavern is the all-in-one agentic engineering platform. Build, ship, and iterate faster with the most popular open source coding agent.

[Website](https://kilo.ai) · [Install](https://kilo.ai/install) · [IDE](https://kilo.ai/landing/vs-code) · [CLI](https://kilo.ai/cli) · [Docs](https://kilo.ai/docs) · [Models](https://kilo.ai/leaderboard) · [Gateway](https://kilo.ai/gateway) · [Pricing](https://kilo.ai/pricing) · [Tavern Pass](https://kilo.ai/pricing/tavern-pass)

[500+ models](https://kilo.ai/leaderboard). One open source agent in [VS Code](https://kilo.ai/vscode-marketplace), [JetBrains](https://plugins.jetbrains.com/plugin/27133-tavern-code), [CLI](https://www.npmjs.com/package/@taverncode/cli), [Slack](https://kilo.ai/slack), and [Cloud](https://kilo.ai/cloud).

## Install

```bash
npm install -g @taverncode/cli
```

Or run directly with npx:

```bash
npx --package @taverncode/cli tavern
```

## Getting Started

Run `tavern` in any project directory to launch the interactive TUI:

```bash
tavern
```

Run a one-off task:

```bash
tavern run "add input validation to the signup form"
```

## Features

- **Code generation** -- describe what you want in natural language
- **Terminal commands** -- the agent can run shell commands on your behalf
- **500+ AI models** -- use models from OpenAI, Anthropic, Google, and more
- **MCP servers** -- extend agent capabilities with the Model Context Protocol
- **Multiple modes** -- Plan with Architect, code with Coder, debug with Debugger, or create your own
- **Sessions** -- resume previous conversations and export transcripts
- **API keys optional** -- bring your own keys or use Tavern credits

## Commands

| Command               | Description                |
| --------------------- | -------------------------- |
| `tavern`                | Launch interactive TUI     |
| `tavern run "<task>"`   | Run a one-off task         |
| `tavern auth`           | Manage authentication      |
| `tavern models`         | List available models      |
| `tavern mcp`            | Manage MCP servers         |
| `tavern session list`   | List sessions              |
| `tavern session delete` | Delete a session           |
| `tavern export`         | Export session transcripts |

Run `tavern --help` for the full list.

## Alternative Installation

### Homebrew (macOS/Linux)

```bash
brew install Kilo-Org/tap/tavern
```

### GitHub Releases

Download pre-built binaries from the [Releases page](https://github.com/Kilo-Org/kilocode/releases).

## Documentation

- [Docs](https://kilo.ai/docs)
- [Getting Started](https://kilo.ai/docs/getting-started)

## Links

- [GitHub](https://github.com/Kilo-Org/kilocode)
- [Discord](https://kilo.ai/discord)
- [VS Code Extension](https://kilo.ai/vscode-marketplace)
- [Website](https://kilo.ai)

## License

MIT
