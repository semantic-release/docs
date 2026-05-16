---
title: "Plugins"
---

Plugins let `semantic-release` extend release steps through configurable lifecycle methods. Core owns the release lifecycle, exposes lifecycle hooks for selected release steps, and invokes plugin methods bound to those hooks.

This enables support for different [commit message conventions](/foundation/how-it-works/#the-core-model), release note generators, and publishing platforms.

A plugin is a npm module that can implement one or more lifecycle methods for the following hooks:

| Lifecycle Hook     | Related Release Step  | Required | Description                                                                                                                                                    |
| ------------------ | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verifyConditions` | Verify Conditions     | No       | Verify conditions necessary to proceed with the release: configuration is correct, authentication tokens are valid, and so on.                                 |
| `analyzeCommits`   | Analyze Commits       | Yes      | Determine the type of the next release (`major`, `minor`, or `patch`). This hook is required to decide the next release type. If multiple plugins implement `analyzeCommits`, the highest release type returned wins. |
| `verifyRelease`    | Verify Release        | No       | Verify the parameters of the release that is about to be published, such as version, type, or distribution tag.                                                |
| `generateNotes`    | Generate Notes        | No       | Generate the content of the release note. If multiple plugins implement `generateNotes`, the release notes will be the concatenation of each plugin output.    |
| `prepare`          | Prepare               | No       | Prepare the release, for example by creating or updating files such as `package.json`, `CHANGELOG.md`, documentation, or compiled assets and pushing a commit. |
| `publish`          | Publish               | No       | Publish the release.                                                                                                                                           |
| `addChannel`       | Add Channel (optional) | No       | Assign the release to a distribution channel when channel management is needed, for example by adding an npm dist-tag.                                         |
| `success`          | Notify                | No       | Notify consumers or maintainers after a successful release.                                                                                                    |
| `fail`             | Notify                | No       | Notify consumers or maintainers after a failed release.                                                                                                        |

For each [release step](/foundation/steps/), **semantic-release** runs every plugin in the [`plugins` array](plugins.md#plugins-declaration-and-execution-order) that implements the hook for that step.

Not every release step is hook-backed. For example, core handles `Get Last Release` and `Create Git Tag` directly. `addChannel` is a special-case hook used only when channel management applies.

:::note
If no plugin with an `analyzeCommits` method is defined `@semantic-release/commit-analyzer` will be used.
:::

## Plugins installation

### Default plugins

These four plugins are already part of **semantic-release** and are listed in order of execution. They should not be installed separately; installing them independently can result in conflicting behavior if multiple versions are present:

```
"@semantic-release/commit-analyzer"
"@semantic-release/release-notes-generator"
"@semantic-release/npm"
"@semantic-release/github"
```

### Additional plugins

[Additional plugins](/extending/plugins-list) should be provided to `npx` with `--package` when running `semantic-release`:

```bash
$ npx \
  --package semantic-release \
  --package @semantic-release/git \
  --package @semantic-release/changelog \
  semantic-release
```

## Plugins declaration and execution order

Each plugin must be configured with the [`plugins` options](/usage/configuration/#plugins) by specifying the list of plugins by npm module name.

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm"
  ]
}
```

:::note
If the `plugins` option is defined, it overrides the default plugin list, rather than merging with it.
:::

For each [release step](/foundation/steps/), the plugins that implement that step's lifecycle hook will be executed in the order in which they are defined.

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/git"
  ]
}
```

With this configuration **semantic-release** will:

- execute the `verifyConditions` implementation of `@semantic-release/npm` then `@semantic-release/git`
- execute the `analyzeCommits` implementation of `@semantic-release/commit-analyzer`
- execute the `generateNotes` implementation of `@semantic-release/release-notes-generator`
- execute the `prepare` implementation of `@semantic-release/npm` then `@semantic-release/git`
- execute the `publish` implementation of `@semantic-release/npm`

Order is first determined by release steps (such as `Verify Conditions` → `Analyze Commits`). At each release step, plugins are executed in the order in which they are defined.

## Plugin options configuration

A plugin configuration can be specified by wrapping the name and an options object in an array. Options configured this way will be passed only to that specific plugin.

Global plugin configuration can be defined at the root of the **semantic-release** configuration object. Options configured this way will be passed to all plugins.

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/github",
      {
        "assets": ["dist/**"]
      }
    ],
    "@semantic-release/git"
  ],
  "preset": "angular"
}
```

With this configuration:

- All plugins will receive the `preset` option, which will be used by both `@semantic-release/commit-analyzer` and `@semantic-release/release-notes-generator` (and ignored by `@semantic-release/github` and `@semantic-release/git`)
- The `@semantic-release/github` plugin will receive the `assets` option (`@semantic-release/git` will not receive it and therefore will use its default value for that option)
