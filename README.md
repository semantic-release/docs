# semantic-release Documentation Site

The official documentation website for [semantic-release](https://github.com/semantic-release/semantic-release), hosted at [semantic-release.org](https://semantic-release.org/).

Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or higher)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts a local development server. The site will be available at `http://localhost:4321`.

### Build

```bash
npm run build
```

Generates the production-ready static site in the `dist/` directory.

### Preview

```bash
npm run preview
```

Serves the built site locally for previewing before deployment.

### Linting

```bash
npm run lint        # Check formatting
npm run lint:fix    # Fix formatting
```

## Project Structure

```
src/
├── assets/          # Images and static assets
├── components/      # Custom Astro components
├── content/docs/    # Documentation pages (Markdown/MDX)
│   ├── usage/       # Getting started, configuration, running semantic-release
│   ├── foundation/  # Concepts, constraints, and mental models of semantic-release
│   ├── extending/   # Plugin and shareable configuration lists
│   ├── recipes/     # CI configurations, git services, workflows
│   ├── support/     # FAQ, troubleshooting, version requirements
│   └── developer-guide/  # JS API, plugin development
└── styles/          # Global styles
```

## Contributing

Contributions are welcome! Please see the [semantic-release contributing guidelines](https://github.com/semantic-release/semantic-release/blob/master/CONTRIBUTING.md).

To contribute to the docs:

1. Fork and clone this repository
2. Create a new branch for your changes
3. Run the site locally with `npm run dev`
4. Make your edits in `src/content/docs/`
5. Submit a pull request

## License

This project is part of the [semantic-release](https://github.com/semantic-release) organization.
