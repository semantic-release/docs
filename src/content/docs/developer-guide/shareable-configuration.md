---
title: "Shareable configuration development"
description: "Create and publish shareable semantic-release configurations to reuse release rules across projects."
---

A shareable configuration is a Node package that exports a reusable **semantic-release** configuration object.

Use this approach when you want multiple repositories to share the same release workflow while still allowing each project to override local details.

If you are looking for how to consume an existing package, see [Shareable Configurations](/foundation/shareable-configurations). This page focuses on authoring and maintaining one.

## Creating a Shareable Configuration Package

Start by creating a Node package with your preferred package manager (`npm init`, `pnpm init`, or `yarn init`).

Then:

1. Choose a package name (for example `@your-scope/semantic-release-config`).
2. Add `semantic-release` as a peer dependency so consuming projects control the runtime version.
3. Export a configuration object from the package entrypoint.

Example `package.json`:

```json title="package.json"
{
  "name": "@your-scope/semantic-release-config",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": "./index.js"
  },
  "peerDependencies": {
    "semantic-release": ">=24.0.0"
  }
}
```

## Exporting the Configuration

Export a plain configuration object containing the same options users would place in `release.config.*`.

```js title="index.js"
/** @type {import('semantic-release').GlobalConfig} */
export default {
  branches: ["main", "next"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github",
  ],
};
```

You can then consume it in a project via [`extends`](/usage/configuration/#extends):

```json title=".releaserc"
{
  "extends": "@your-scope/semantic-release-config"
}
```

## Composing Multiple Shareable Configurations

It is valid to publish focused configurations and compose them.

For example, one package can provide branch policy and another can provide plugin defaults:

```json title=".releaserc"
{
  "extends": [
    "@your-scope/semantic-release-config-base",
    "@your-scope/semantic-release-config-github"
  ]
}
```

Configurations are loaded in order. Later entries override earlier ones, and the local project configuration overrides all extended values.

## Defining Plugin Options in a Shareable Configuration

When setting plugin options, use the tuple form (`[pluginName, options]`) exactly as in regular semantic-release configuration:

```js title="index.js"
/** @type {import('semantic-release').GlobalConfig} */
export default {
  plugins: [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
      },
    ],
    [
      "@semantic-release/github",
      {
        successComment: false,
      },
    ],
  ],
};
```

Keep defaults broad and reusable. Avoid embedding project-specific values such as repository names, package access levels, or custom file lists unless those values are guaranteed across all consumers.

## Supporting Local Overrides Safely

Consumer repositories will often need local overrides for branches, plugin options, or additional plugins.

Example:

```js title="release.config.mjs"
/** @type {import('semantic-release').GlobalConfig} */
export default {
  extends: "@your-scope/semantic-release-config",
  branches: ["main", "beta"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    ["@semantic-release/github", { successComment: true }],
  ],
};
```

Because `plugins` is an array, redefining it in local config replaces the inherited list. Document this clearly in your shareable configuration README so consumers know when to copy and modify the full array.

## Testing the Configuration

Before publishing, test the package in a sample repository:

1. Create a small test project with commit history following your expected commit convention.
2. Install your config package and all required plugins.
3. Add a local release config that extends your package.
4. Run semantic-release with `--dry-run --debug` in CI-like conditions.

```bash
$ npx semantic-release --dry-run --debug
```

Validate that:

- The configuration loads correctly.
- The expected branch rules apply.
- Commit analysis returns the expected release type.
- Release notes and plugin options behave as intended.

## Publishing and Versioning the Configuration

Treat a shareable configuration package like any other public API.

- Publish patch releases for safe fixes.
- Publish minor releases for backward-compatible defaults or additions.
- Publish major releases for breaking changes such as removing plugins, changing branch rules, or modifying plugin option defaults in incompatible ways.

When releasing breaking changes, provide a migration section in your changelog with exact before/after examples.

## Maintenance Guidelines

To keep the configuration stable across many repositories:

- Keep required assumptions explicit (for example expected CI env vars, required tokens, commit message conventions).
- Pin only when necessary; prefer compatibility ranges for peer dependencies.
- Add automated tests that exercise key scenarios using dry-run releases.
- Document how consumers should override branches or plugins without accidentally disabling required behavior.

If you publish your package publicly, consider adding it to the [shareable configurations list](/extending/shareable-configurations-list).
