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
import { KiloAuthPlugin } from "@taverncode/tavern-gateway"

// Register with OpenCode
const plugins = [KiloAuthPlugin]
```

### Provider Usage

```typescript
import { createKilo } from "@taverncode/tavern-gateway"

const provider = createKilo({
  taverncodeToken: process.env.KILOCODE_API_KEY,
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
