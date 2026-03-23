# Contributing to Awesome Task Manager

Thank you for your interest in contributing!

## How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Write tests for new functionality
5. Ensure all tests pass
6. Commit: `git commit -m "Add my feature"`
7. Push: `git push origin feature/my-feature`
8. Open a Pull Request

## Development Setup

1. Clone the repo into your Obsidian vault:
cd [vault]/.obsidian/plugins/ git clone https://github.com/[username]/awesome-task-manager.git cd awesome-task-manager npm install npm run dev


2. Enable the plugin in Obsidian Settings
3. Use `Ctrl+Shift+I` to open Developer Tools

## Code Style

- TypeScript strict mode
- No external dependencies
- All user-facing strings must use i18n (`t("key")`)
- New features must include tests

## Adding a New Language

1. Copy `src/i18n/locales/en.json` to `src/i18n/locales/xx.json`
2. Translate all values
3. Register in `src/i18n/i18n.ts`
4. Add option in `src/settings/SettingsTab.ts`

## License

By contributing, you agree that your contributions will be licensed
under the MIT License.