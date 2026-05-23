# OpenModels CLI

Command-line interface for the [OpenModels](https://openmodels.run) registry — browse models, compare providers, and check telemetry from your terminal.

[![npm version](https://img.shields.io/npm/v/openmodels-cli.svg)](https://www.npmjs.com/package/openmodels-cli)
[![license](https://img.shields.io/npm/l/openmodels-cli.svg)](https://github.com/openmodelsrun/cli/blob/main/LICENSE)

## Installation

```bash
# Install globally
npm install -g openmodels-cli

# Or run without installing
npx openmodels-cli
```

Requires **Node.js ≥ 22.0.0**.

## Quick Start

```bash
# List all models
openmodels models list

# Get details about a specific model
openmodels models info claude-opus-4-6

# Compare providers for a model
openmodels compare gpt-5

# Search models
openmodels search "code generation"

# Check provider health
openmodels telemetry anthropic
```

## Commands

### `models list`

List models with optional filters.

```bash
openmodels models list
openmodels models list --capability reasoning
openmodels models list --modality text --sort context_window
openmodels models list --page 2 --limit 20
```

| Option | Description |
|--------|-------------|
| `--capability <cap>` | Filter by capability (chat, completion, function-calling, code-generation, reasoning, vision, audio, embeddings, fine-tuning) |
| `--modality <mod>` | Filter by modality (text, image, audio, video, code) |
| `--sort <field>` | Sort by: `name`, `recency`, `context_window`, `providers` |
| `--page <n>` | Page number |
| `--limit <n>` | Results per page |

### `models info <model-id>`

Display detailed information about a specific model including capabilities, modalities, context window, licensing, and provider availability with pricing.

```bash
openmodels models info claude-opus-4-6
openmodels models info deepseek-r1 --format json
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
openmodels compare gpt-5
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
openmodels search "reasoning"
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

All commands support the `--format` flag:

```bash
openmodels models list --format table   # Default — colored, aligned columns
openmodels models list --format json    # Machine-readable JSON
openmodels models list --format yaml    # YAML output
```

JSON and YAML formats are designed for piping to other tools and CI/CD pipelines.

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

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENMODELS_API_URL` | API base URL (default: `https://api.openmodels.run`) |
| `OPENMODELS_API_KEY` | API authentication key |
| `NO_COLOR` | Disable colored output (any value) |

### Precedence

1. CLI flags (`--api-url`, `--api-key`, `--format`, `--no-color`)
2. Environment variables
3. Config file (`~/.openmodelsrc`)
4. Defaults

## Global Options

| Flag | Description |
|------|-------------|
| `--format <type>` | Output format: `table`, `json`, `yaml` |
| `--api-url <url>` | API base URL |
| `--api-key <key>` | API authentication key |
| `--no-color` | Disable colored output |
| `--verbose` | Show detailed error information |
| `-h, --help` | Show help |
| `-V, --version` | Show version |

## What is OpenModels?

[OpenModels](https://openmodels.run) is an open-source, community-maintained registry of LLM models, inference providers, and provider-model mappings. It tracks 88+ models across 42+ providers with pricing, rate limits, and availability data.

## Links

- **Website:** [openmodels.run](https://openmodels.run)
- **API:** [api.openmodels.run](https://api.openmodels.run)
- **Registry:** [github.com/openmodelsrun/openmodels](https://github.com/openmodelsrun/openmodels)
- **Docs:** [openmodels.run/docs](https://openmodels.run/docs)

## Development

```bash
git clone https://github.com/openmodelsrun/cli.git
cd cli
npm install
npm run build
npm test
```

## License

MIT
