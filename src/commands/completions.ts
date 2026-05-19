import type { Command } from 'commander';

const COMMANDS = 'models providers compare search telemetry completions';
const SUBCOMMANDS_MODELS = 'list info';
const SUBCOMMANDS_PROVIDERS = 'list';
const GLOBAL_FLAGS = '--format --api-url --api-key --no-color --verbose --help --version';
const FORMAT_VALUES = 'table json yaml';
const SORT_VALUES = 'name recency context_window providers price rate_limit';

function getBashCompletionScript(): string {
  return `#!/bin/bash
# openmodels bash completion script
# Install: openmodels completions bash >> ~/.bashrc

_openmodels_completions() {
  local cur prev commands
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  commands="${COMMANDS}"

  case "\${COMP_WORDS[1]}" in
    models)
      if [[ \${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( \$(compgen -W "${SUBCOMMANDS_MODELS}" -- "\${cur}") )
        return 0
      fi
      case "\${prev}" in
        --sort)
          COMPREPLY=( \$(compgen -W "${SORT_VALUES}" -- "\${cur}") )
          return 0
          ;;
        --format)
          COMPREPLY=( \$(compgen -W "${FORMAT_VALUES}" -- "\${cur}") )
          return 0
          ;;
      esac
      COMPREPLY=( \$(compgen -W "--capability --modality --sort --page --limit ${GLOBAL_FLAGS}" -- "\${cur}") )
      return 0
      ;;
    providers)
      if [[ \${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( \$(compgen -W "${SUBCOMMANDS_PROVIDERS}" -- "\${cur}") )
        return 0
      fi
      case "\${prev}" in
        --format)
          COMPREPLY=( \$(compgen -W "${FORMAT_VALUES}" -- "\${cur}") )
          return 0
          ;;
      esac
      COMPREPLY=( \$(compgen -W "--search --page --limit ${GLOBAL_FLAGS}" -- "\${cur}") )
      return 0
      ;;
    compare)
      case "\${prev}" in
        --sort)
          COMPREPLY=( \$(compgen -W "${SORT_VALUES}" -- "\${cur}") )
          return 0
          ;;
        --format)
          COMPREPLY=( \$(compgen -W "${FORMAT_VALUES}" -- "\${cur}") )
          return 0
          ;;
      esac
      COMPREPLY=( \$(compgen -W "--sort ${GLOBAL_FLAGS}" -- "\${cur}") )
      return 0
      ;;
    search)
      case "\${prev}" in
        --format)
          COMPREPLY=( \$(compgen -W "${FORMAT_VALUES}" -- "\${cur}") )
          return 0
          ;;
      esac
      COMPREPLY=( \$(compgen -W "--capability --limit ${GLOBAL_FLAGS}" -- "\${cur}") )
      return 0
      ;;
    telemetry)
      case "\${prev}" in
        --format)
          COMPREPLY=( \$(compgen -W "${FORMAT_VALUES}" -- "\${cur}") )
          return 0
          ;;
      esac
      COMPREPLY=( \$(compgen -W "--period ${GLOBAL_FLAGS}" -- "\${cur}") )
      return 0
      ;;
    completions)
      COMPREPLY=( \$(compgen -W "bash zsh fish" -- "\${cur}") )
      return 0
      ;;
  esac

  case "\${prev}" in
    --format)
      COMPREPLY=( \$(compgen -W "${FORMAT_VALUES}" -- "\${cur}") )
      return 0
      ;;
  esac

  if [[ "\${cur}" == -* ]]; then
    COMPREPLY=( \$(compgen -W "${GLOBAL_FLAGS}" -- "\${cur}") )
    return 0
  fi

  COMPREPLY=( \$(compgen -W "\${commands}" -- "\${cur}") )
  return 0
}

complete -F _openmodels_completions openmodels
`;
}

function getZshCompletionScript(): string {
  return `#compdef openmodels
# openmodels zsh completion script
# Install: openmodels completions zsh > ~/.zfunc/_openmodels

_openmodels() {
  local -a commands subcommands global_flags format_values sort_values

  commands=(
    'models:Browse and inspect models'
    'providers:List inference providers'
    'compare:Compare providers for a model'
    'search:Search models by keyword'
    'telemetry:View telemetry data for a provider'
    'completions:Generate shell completion scripts'
  )

  global_flags=(
    '--format[Output format]:format:(${FORMAT_VALUES})'
    '--api-url[API base URL]:url:'
    '--api-key[API key for authentication]:key:'
    '--no-color[Disable color output]'
    '--verbose[Show detailed error output]'
    '--help[Show help]'
    '--version[Show version]'
  )

  format_values=(${FORMAT_VALUES})
  sort_values=(${SORT_VALUES})

  if (( CURRENT == 2 )); then
    _describe -t commands 'openmodels commands' commands
    return
  fi

  case "\${words[2]}" in
    models)
      if (( CURRENT == 3 )); then
        local -a model_commands
        model_commands=(
          'list:List models with optional filters'
          'info:Show detailed model information'
        )
        _describe -t commands 'models subcommands' model_commands
        return
      fi
      _arguments \\
        '--capability[Filter by capability]:capability:' \\
        '--modality[Filter by modality]:modality:' \\
        '--sort[Sort by field]:field:(${SORT_VALUES})' \\
        '--page[Page number]:page:' \\
        '--limit[Results per page]:limit:' \\
        '--format[Output format]:format:(${FORMAT_VALUES})' \\
        '*: :_default'
      ;;
    providers)
      if (( CURRENT == 3 )); then
        local -a provider_commands
        provider_commands=(
          'list:List all providers'
        )
        _describe -t commands 'providers subcommands' provider_commands
        return
      fi
      _arguments \\
        '--search[Filter by search term]:search:' \\
        '--page[Page number]:page:' \\
        '--limit[Results per page]:limit:' \\
        '--format[Output format]:format:(${FORMAT_VALUES})' \\
        '*: :_default'
      ;;
    compare)
      _arguments \\
        '--sort[Sort by field]:field:(${SORT_VALUES})' \\
        '--format[Output format]:format:(${FORMAT_VALUES})' \\
        '*: :_default'
      ;;
    search)
      _arguments \\
        '--capability[Filter by capability]:capability:' \\
        '--limit[Results limit]:limit:' \\
        '--format[Output format]:format:(${FORMAT_VALUES})' \\
        '*: :_default'
      ;;
    telemetry)
      _arguments \\
        '--period[Time period]:period:(1d 7d 30d)' \\
        '--format[Output format]:format:(${FORMAT_VALUES})' \\
        '*: :_default'
      ;;
    completions)
      if (( CURRENT == 3 )); then
        _values 'shell' bash zsh fish
        return
      fi
      ;;
  esac
}

_openmodels "\$@"
`;
}

function getFishCompletionScript(): string {
  return `# openmodels fish completion script
# Install: openmodels completions fish > ~/.config/fish/completions/openmodels.fish

# Disable file completions
complete -c openmodels -f

# Top-level commands
complete -c openmodels -n "__fish_use_subcommand" -a "models" -d "Browse and inspect models"
complete -c openmodels -n "__fish_use_subcommand" -a "providers" -d "List inference providers"
complete -c openmodels -n "__fish_use_subcommand" -a "compare" -d "Compare providers for a model"
complete -c openmodels -n "__fish_use_subcommand" -a "search" -d "Search models by keyword"
complete -c openmodels -n "__fish_use_subcommand" -a "telemetry" -d "View telemetry data for a provider"
complete -c openmodels -n "__fish_use_subcommand" -a "completions" -d "Generate shell completion scripts"

# Global flags
complete -c openmodels -l format -d "Output format" -a "${FORMAT_VALUES}"
complete -c openmodels -l api-url -d "API base URL"
complete -c openmodels -l api-key -d "API key for authentication"
complete -c openmodels -l no-color -d "Disable color output"
complete -c openmodels -l verbose -d "Show detailed error output"

# models subcommands
complete -c openmodels -n "__fish_seen_subcommand_from models; and not __fish_seen_subcommand_from list info" -a "list" -d "List models with optional filters"
complete -c openmodels -n "__fish_seen_subcommand_from models; and not __fish_seen_subcommand_from list info" -a "info" -d "Show detailed model information"

# models list flags
complete -c openmodels -n "__fish_seen_subcommand_from models; and __fish_seen_subcommand_from list" -l capability -d "Filter by capability"
complete -c openmodels -n "__fish_seen_subcommand_from models; and __fish_seen_subcommand_from list" -l modality -d "Filter by modality"
complete -c openmodels -n "__fish_seen_subcommand_from models; and __fish_seen_subcommand_from list" -l sort -d "Sort by field" -a "${SORT_VALUES}"
complete -c openmodels -n "__fish_seen_subcommand_from models; and __fish_seen_subcommand_from list" -l page -d "Page number"
complete -c openmodels -n "__fish_seen_subcommand_from models; and __fish_seen_subcommand_from list" -l limit -d "Results per page"

# providers subcommands
complete -c openmodels -n "__fish_seen_subcommand_from providers; and not __fish_seen_subcommand_from list" -a "list" -d "List all providers"

# providers list flags
complete -c openmodels -n "__fish_seen_subcommand_from providers; and __fish_seen_subcommand_from list" -l search -d "Filter by search term"
complete -c openmodels -n "__fish_seen_subcommand_from providers; and __fish_seen_subcommand_from list" -l page -d "Page number"
complete -c openmodels -n "__fish_seen_subcommand_from providers; and __fish_seen_subcommand_from list" -l limit -d "Results per page"

# compare flags
complete -c openmodels -n "__fish_seen_subcommand_from compare" -l sort -d "Sort by field" -a "${SORT_VALUES}"
complete -c openmodels -n "__fish_seen_subcommand_from compare" -l format -d "Output format" -a "${FORMAT_VALUES}"

# search flags
complete -c openmodels -n "__fish_seen_subcommand_from search" -l capability -d "Filter by capability"
complete -c openmodels -n "__fish_seen_subcommand_from search" -l limit -d "Results limit"
complete -c openmodels -n "__fish_seen_subcommand_from search" -l format -d "Output format" -a "${FORMAT_VALUES}"

# telemetry flags
complete -c openmodels -n "__fish_seen_subcommand_from telemetry" -l period -d "Time period" -a "1d 7d 30d"
complete -c openmodels -n "__fish_seen_subcommand_from telemetry" -l format -d "Output format" -a "${FORMAT_VALUES}"

# completions subcommand
complete -c openmodels -n "__fish_seen_subcommand_from completions" -a "bash" -d "Generate bash completions"
complete -c openmodels -n "__fish_seen_subcommand_from completions" -a "zsh" -d "Generate zsh completions"
complete -c openmodels -n "__fish_seen_subcommand_from completions" -a "fish" -d "Generate fish completions"
`;
}

export function registerCompletionsCommand(program: Command): void {
  program
    .command('completions')
    .description('Generate shell completion scripts')
    .argument('<shell>', 'Shell type: bash, zsh, or fish')
    .addHelpText('after', `
Installation:
  bash:  openmodels completions bash >> ~/.bashrc
  zsh:   openmodels completions zsh > ~/.zfunc/_openmodels
  fish:  openmodels completions fish > ~/.config/fish/completions/openmodels.fish

After installing, restart your shell or source the config file.
`)
    .action((shell: string) => {
      switch (shell) {
        case 'bash':
          process.stdout.write(getBashCompletionScript());
          break;
        case 'zsh':
          process.stdout.write(getZshCompletionScript());
          break;
        case 'fish':
          process.stdout.write(getFishCompletionScript());
          break;
        default:
          console.error(`Error: Unsupported shell "${shell}". Supported shells: bash, zsh, fish`);
          process.exit(1);
      }
    });
}
