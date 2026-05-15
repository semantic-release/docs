---
title: Release Steps
---

This page explains the release steps that make up a `semantic-release` run.

- A **release lifecycle** is the full recurring process that starts from the previous release state and ends with the next release state.
- **Release steps** are the individual phases within one run of that lifecycle.
- Some release steps expose **lifecycle hooks** that plugins can bind to.
- Plugins participate by exposing **lifecycle methods** such as `analyzeCommits` or `publish`.

If you are new to the overall model, read [How it Works](/foundation/how-it-works/) first.

## Release step sequence

After tests pass and `semantic-release` starts, it evaluates the repository state and executes release steps in a fixed order.

| Release Step           | Lifecycle Hook(s)  | Purpose                                                         |
| ---------------------- | ------------------ | --------------------------------------------------------------- |
| Verify Conditions      | `verifyConditions` | Confirm required configuration and credentials are available.   |
| Get Last Release       | None               | Find the most recent release by reading Git tags and history.   |
| Analyze Commits        | `analyzeCommits`   | Determine whether to release and which version type to produce. |
| Verify Release         | `verifyRelease`    | Validate the computed release metadata before publishing.       |
| Generate Notes         | `generateNotes`    | Build release notes for the commits included in this release.   |
| Create Git Tag         | None               | Tag the release version in Git.                                 |
| Add Channel (Optional) | `addChannel`       | Associate the release with a distribution channel when needed.  |
| Prepare                | `prepare`          | Perform pre-publish updates such as assets or files.            |
| Publish                | `publish`          | Publish artifacts to configured destinations and channels.      |
| Notify                 | `success`, `fail`  | Report success or failure through provider integrations.        |

The order is important. A failure in an early step prevents later steps from running.

## Optional and conditional steps

Not every release step in the table above runs on every release.

- Some release steps are core-only and do not expose lifecycle hooks. `Get Last Release` is the clearest example.
- Some steps expose more than one lifecycle hook. `Notify` is implemented through the `success` and `fail` hooks.
- Some release steps are conditional. The `Add Channel` release step is an example; it runs only when channel management behavior is needed.

## How steps are implemented

Release steps are executed by a combination of core behavior and plugins.

- Core handles some behavior directly, including steps that are not exposed as hooks
- `analyzeCommits` is required to decide version impact
- Most hook-backed steps depend on which plugins you configure
- If multiple plugins implement the same lifecycle hook, they execute in plugin order

For plugin responsibilities and execution details, see [Plugins](/foundation/plugins/).

## Release decision logic

The `analyzeCommits` step is the decision point for whether a release is created.

- No relevant commits since the last release means no new release
- `fix` commits typically result in a patch release
- `feat` commits typically result in a minor release
- `BREAKING CHANGE` results in a major release

Commit parsing depends on your configured commit analyzer and presets. See [How it Works](/foundation/how-it-works/) for the conceptual model and [Configuration](/usage/configuration/) for setup details.

## Branch and channel impact

The same steps run regardless of branch type, but release outcomes vary with branch strategy and channel configuration.

- Release branches publish regular versions
- Maintenance branches publish within defined ranges
- Pre-release branches publish pre-release identifiers

See [Supported Branching Models](/foundation/supported-branching/) and [Release Workflow Configuration](/foundation/workflow-configuration/) for branch behavior and constraints.

## Operational expectations

To keep releases deterministic, run `semantic-release` only in CI and only after all required checks pass.

For implementation guidance, see:

- [Getting Started](/usage/getting-started/)
- [CI Configuration](/usage/ci-configuration/)
- [Running semantic-release](/usage/running/)
