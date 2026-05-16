---
title: "Shareable Configurations"
---

A shareable configuration is an [npm](https://www.npmjs.com/) package that exports a reusable **semantic-release** configuration object. It lets teams define a common release workflow once and apply it across several projects.

## When to use it

Use a shareable configuration when multiple repositories should follow the same release workflow and only need small project-specific overrides.

In practice, a shareable configuration usually provides the base configuration, while each project keeps only the settings that differ locally.

## How to use it

The shareable configurations to use can be set with the [extends](/usage/configuration/#extends) option, using either an npm package name or a local file path.

```json
{
	"extends": "@semantic-release/gitlab-config"
}
```

For example, a project can extend a shared base config and still override its own branches locally:

```json
{
	"extends": "@semantic-release/gitlab-config",
	"branches": ["main", "next"]
}
```

If multiple shareable configurations are defined, they are loaded in order. Local configuration and CLI arguments take precedence over values defined in a shareable configuration.

## Shareable Configurations list

See the [shareable configurations list](/extending/shareable-configurations-list) for official and community-maintained packages you can extend.

If you want to build your own shareable configuration, see [Shareable configuration development](/developer-guide/shareable-configuration/).

