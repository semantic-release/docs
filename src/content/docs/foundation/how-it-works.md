---
title: How it Works
---

**semantic-release** automates package release workflows by turning commit history into predictable versioning and publishing decisions.

At a high level, it answers three questions on every run:

1. Should a release happen?
2. If yes, what version should be released?
3. Where and how should that release be published?

## The core model

When `semantic-release` runs in CI on a configured release branch, it compares commits since the last Git tag and determines release impact from commit semantics.

This relies on a formalized commit message convention. By default, **semantic-release** uses the [Angular Commit Message Conventions](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md), where the type prefix in each commit message signals the impact of that change:

- `fix` commits produce patch releases
- `feat` commits produce minor releases
- `BREAKING CHANGE` in a commit footer produces major releases

If no commits since the last release carry a recognized type, no release is published.

Tools like [commitizen](https://github.com/commitizen/cz-cli) and [commitlint](https://github.com/conventional-changelog/commitlint) can help contributors author valid commit messages consistently.

For deeper details on commit analysis and lifecycle phases, see [Release Steps](/foundation/steps/) and [Plugins](/foundation/plugins/).

## Why CI is central

The release command is designed to run in CI after successful builds. This keeps releases deterministic and removes manual, error-prone release actions.

Each push or merge to a release branch can trigger a release run. Whether that run publishes depends on commit analysis, branch configuration, and plugin behavior.

For setup guidance, see [CI Configuration](/usage/ci-configuration/) and [Getting Started](/usage/getting-started/).

## What drives release behavior

Release behavior is determined by a small set of inputs:

- Commit history since the last release tag
- Branch configuration (release, maintenance, pre-release)
- Plugin pipeline and plugin options
- Credentials available in the CI environment

Those inputs produce outputs such as:

- The next semantic version
- Release notes
- Git tags
- Published artifacts or channels (for example npm dist-tags)

See [Release Workflow Configuration](/foundation/workflow-configuration/) and [Supported Branching Models](/foundation/supported-branching/) for branching behavior.

## Safety and constraints

**semantic-release** is intentionally opinionated. It prioritizes consistent semantic versioning and continuous delivery/release workflows over manual or ad hoc processes.

That means it may refuse to publish when conditions are invalid, such as version conflicts across branches, missing release branches, or failed verification steps.

Read [Considerations](/foundation/considerations/) before designing a workflow that diverges from these assumptions.