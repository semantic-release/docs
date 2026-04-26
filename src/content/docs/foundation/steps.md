---
title: Release Steps
---

This page explains the release lifecycle that runs when `semantic-release` is executed. If you are new to the overall model, read [How it Works](/foundation/how-it-works/) first.

## Lifecycle overview

After tests pass and `semantic-release` starts, it evaluates the repository state and executes release steps in a fixed order.

| Step              | Purpose                                                         |
| ----------------- | --------------------------------------------------------------- |
| Verify Conditions | Confirm required configuration and credentials are available.   |
| Get Last Release  | Find the most recent release by reading Git tags/history.       |
| Analyze Commits   | Determine whether to release and which version type to produce. |
| Verify Release    | Validate the computed release metadata before publishing.       |
| Generate Notes    | Build release notes for the commits included in this release.   |
| Create Git Tag    | Tag the release version in Git.                                 |
| Prepare           | Perform pre-publish updates such as assets or files.            |
| Publish           | Publish artifacts to configured destinations and channels.      |
| Notify            | Report success or failure through provider integrations.        |

The order is important. A failure in an early step prevents later steps from running.

## How steps are implemented

Each lifecycle step is implemented by plugins. Some steps are optional, some are required for a valid release pipeline.

- `analyzeCommits` is required to decide version impact
- Most other steps depend on which plugins you configure
- If multiple plugins implement the same step, they execute in plugin order

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
