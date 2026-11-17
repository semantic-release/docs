---
title: Release Tool Composition
description: "Understand how release engines, plugins, configuration, and tool-specific policies combine into release packages and scripts."
---

**Release tool composition** is the practice of building a release tool around a composable engine. In semantic-release, [`@semantic-release/core`](https://github.com/semantic-release/core) provides the release lifecycle; a tool combines it with configuration, plugins, and its own policies and interface.

This gives teams room to build different tools on the same release machinery: a reusable release package for multiple repositories, a custom CLI for an organization, or a script for a specific workflow. The `semantic-release` package composes core with its CLI, default plugin profile, and wrapper-level CI policies. A custom release package or script can call core directly and define its own choices.

## The parts of a release tool

- **Release engine**: coordinates configuration, branch and version decisions, Git operations, and plugin lifecycle steps.
- **Configuration**: sets release branches, options, and which plugins participate. A [shareable configuration](/foundation/shareable-configurations/) can package defaults for reuse.
- **Plugins**: implement the release steps, such as analyzing commits, generating notes, preparing artifacts, or publishing. See [Plugins](/foundation/plugins/).
- **Tool policy and interface**: handles concerns such as command-line arguments, CI-specific behavior, default plugin choices, logging, and output.

## When to compose a tool

Build a package when multiple repositories need the same opinionated workflow or a team needs a reusable command. Write a custom script when a particular automation needs to control configuration, plugins, or how a release run is invoked. For ordinary use of the standard command, use `semantic-release` directly.

Core supports two common approaches:

- **Config-driven**: resolve configuration and let core build the plugin pipeline.
- **Direct**: resolve options and pass an explicit plugin list or pipeline from your tool.

To compose your own release tool, see [Composing a release tool](/developer-guide/core-api/#composing-a-release-tool) for guidance and examples of both approaches. The [How it Works](/foundation/how-it-works/) page describes the release lifecycle these tools compose.
