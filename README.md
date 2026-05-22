# OpenModels CLI

Command-line interface for the [OpenModels](https://openmodels.run) registry — browse models, compare providers, and check telemetry from your terminal.

## Installation

```bash
# Run without installing
npx openmodels

# Install globally
npm install -g openmodels
```

Requires **Node.js ≥ 22.0.0**.

## Quick Start

```bash
# List all models
openmodels models list

# Get details about a specific model
openmodels models info claude-opus-4-6

# Compare providers for a model
openmodels compare gpt-4o

# Search models
openmodels search "code generation"
```

## Commands

### `models list`

List models with optional filters.

```bash
openmodels models list
openmodels models list --capability chat
openmodels models list --modality text --sort context_window
openmodels models list --page 2 --limit 20
```

| Option | Description |
|--------|-------------|
| `--capability <cap>` | Filter by capability (e.g., chat, code, reasoning) |
| `--modality <mod>` | Filter by modality (e.g., text, image, audio) |
| `--sort <field>` | Sort by: `name`, `recency`, `context_window`, `providers` |
| `--page <n>` | Page number |
| `--limit <n>` | Results per page |

### `models info <model-id>`

Display detailed information about a specific model including capabilities, modalities, context window, licensing, and provider availability with pricing.

```bash
openmodels models info claude-opus-4-6
openmodels models info gpt-4o --format json
```

### `providers list`

List inference providers.

```bash
openmodels providers list
openmodels providers list --search anthropic
openmodels providers list --page 1 --limit 10
```

| Option | Description |
|--------|-------------|
| `--search <term>` | Filter providers by search term |
| `--page <n>` | Page number |
| `--limit <n>` | Results per page |

### `compare <model-id>`

Compare all providers offering a specific model side-by-side, showing pricing, rate limits, and regions.

```bash
openmodels compare gpt-4o
openmodels compare claude-opus-4-6 --sort rate_limit
openmodels compare deepseek-r1 --format yaml
```

| Option | Description |
|--------|-------------|
| `--sort <field>` | Sort by: `price` (default), `rate_limit` |

### `search <query>`

Full-text search across models by name or description.

```bash
openmodels search "code generation"
openmodels search "vision" --capability chat --limit 5
```

| Option | Description |
|--------|-------------|
| `--capability <cap>` | Additionally filter by capability |
| `--limit <n>` | Maximum number of results |

### `telemetry <provider-id>`

View provider health status and latency metrics.

```bash
openmodels telemetry anthropic
openmodels telemetry together-ai --period 7d
openmodels telemetry openai --format json
```

| Option | Description |
|--------|-------------|
| `--period <period>` | Time period: `1d`, `7d`, `30d` |

Output includes current status (up/down), uptime percentage, average time-to-first-token, average total response time, and p95 percentiles.

### `completions <shell>`

Generate shell completion scripts.

```bash
# Bash
openmodels completions bash >> ~/.bashrc

# Zsh
openmodels completions zsh > ~/.zfunc/_openmodels

# Fish
openmodels completions fish > ~/.config/fish/completions/openmodels.fish
```

## Output Formats

All commands support the `--format` flag to control output:

```bash
openmodels models list --format table   # Default — human-readable aligned columns
openmodels models list --format json    # Machine-readable JSON
openmodels models list --format yaml    # YAML output
```

Table format uses colored headers and status indicators for interactive use. JSON and YAML formats are designed for piping to other tools and CI/CD pipelines.

## Configuration

### Config File

Create `~/.openmodelsrc` to store default settings:

```json
{
  "api_url": "https://api.openmodels.run",
  "api_key": "om_...",
  "format": "table",
  "no_color": false
}
```

All fields are optional. If the file contains invalid JSON, the CLI prints a warning and continues with defaults.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENMODELS_API_URL` | API base URL (default: `https://api.openmodels.run`) |
| `OPENMODELS_API_KEY` | API authentication key |
| `NO_COLOR` | Disable colored output (any value) |

### Precedence

Configuration is resolved with the following priority (highest to lowest):

1. CLI flags (`--api-url`, `--api-key`, `--format`, `--no-color`)
2. Environment variables (`OPENMODELS_API_URL`, `OPENMODELS_API_KEY`)
3. Config file (`~/.openmodelsrc`)
4. Defaults (`api_url: https://api.openmodels.run`, `format: table`)

## Global Options

| Flag | Description |
|------|-------------|
| `--format <type>` | Output format: `table`, `json`, `yaml` |
| `--api-url <url>` | API base URL |
| `--api-key <key>` | API authentication key |
| `--no-color` | Disable colored output |
| `--verbose` | Show detailed error information including stack traces |
| `-h, --help` | Show help |
| `-V, --version` | Show version |

## Error Handling

The CLI provides clear, actionable error messages:

- **Resource not found** — when a model or provider ID doesn't exist
- **Rate limited** — suggests waiting before retrying
- **Network errors** — suggests checking connectivity
- **Unexpected errors** — use `--verbose` for full details

All errors are written to stderr so piped output remains clean. The CLI exits with code 0 on success and non-zero on failure.

## Development

```bash
cd cli

# Install dependencies
npm install

# Build
npm run build

# Run in development (watch mode)
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

## License

MIT
