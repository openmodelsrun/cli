# OpenModels CLI

CLI for the [OpenModels](https://openmodels.run) — browse models, compare providers and check telemetry from terminal.

## Installation

```bash
# Run without installing
npx @openmodels/cli

# Install globally
npm install -g @openmodels/cli
```

Requires **Node.js ≥ 22.0.0**.

## Usage

```bash
# List all models
openmodels models list

# Filter by capability
openmodels models list --capability chat --sort context_window

# View model details
openmodels models info claude-opus-4-6

# Compare providers for a model
openmodels compare gpt-4o --sort price

# Search models
openmodels search "code generation" --limit 10

# List providers
openmodels providers list --search anthropic

# Check provider telemetry
openmodels telemetry anthropic --period 7d
```

## Output Formats

All commands support `--format` to control output:

```bash
openmodels models list --format table   # Default, human-readable
openmodels models list --format json    # Machine-readable JSON
openmodels models list --format yaml    # YAML output
```

## Configuration

### Config File

Create `~/.openmodelsrc` with default settings:

```json
{
  "api_url": "https://api.openmodels.run",
  "api_key": "om_...",
  "format": "table",
  "no_color": false
}
```

### Environment Variables

```bash
export OPENMODELS_API_URL=https://api.openmodels.run
export OPENMODELS_API_KEY=om_...
```

### Precedence

CLI flags > Environment variables > Config file > Defaults

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

## Commands

| Command | Description |
|---------|-------------|
| `models list` | List models with optional filters |
| `models info <id>` | Show detailed model information |
| `providers list` | List inference providers |
| `compare <model-id>` | Compare providers for a model |
| `search <query>` | Search models by name or description |
| `telemetry <provider-id>` | View provider health and latency |
| `completions <shell>` | Generate shell completions |

## Shell Completions

```bash
# Bash
openmodels completions bash >> ~/.bashrc

# Zsh
openmodels completions zsh > ~/.zfunc/_openmodels

# Fish
openmodels completions fish > ~/.config/fish/completions/openmodels.fish
```

## Development

```bash
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

## Documentation

Full documentation available at [docs.openmodels.run](https://docs.openmodels.run).

## License

MIT
