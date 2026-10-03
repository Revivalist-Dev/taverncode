# @taverncode/tavern-gateway

Unified Tavern Gateway package for OpenCode providing authentication, AI provider integration, and API access.

## Features

- **Authentication**: Device authorization flow for Tavern Gateway
- **AI Provider**: OpenRouter-based provider with Tavern Gateway integration
- **API Integration**: Profile, balance, and model management
- **TUI Helpers**: Utilities for terminal UI components

## Installation

```bash
bun add @taverncode/tavern-gateway
```

## Usage

### Plugin Registration

```typescript
import { TavernAuthPlugin } from "@taverncode/tavern-gateway"

// Register with OpenCode
const plugins = [TavernAuthPlugin]
```

### Provider Usage

```typescript
import { createTavern } from "@taverncode/tavern-gateway"

const provider = createTavern({
  taverncodeToken: process.env.TAVERNCODE_API_KEY,
  taverncodeOrganizationId: "org-123",
})

const model = provider.languageModel("anthropic/claude-sonnet-4")
```

### API Access

```typescript
import { fetchProfile, fetchBalance } from "@taverncode/tavern-gateway"

const profile = await fetchProfile(token)
const balance = await fetchBalance(token)
```

## License

MIT
