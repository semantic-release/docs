---
title: "Core API"
description: "Compose release tools with the @semantic-release/core API, from reusable packages to custom scripts."
---

[`@semantic-release/core`](https://github.com/semantic-release/core) is the composable release engine behind `semantic-release`. Use it when you are creating a release package, building a custom CLI, or writing a script that needs to control how a release runs. For the concepts behind this approach, see [Release Tool Composition](/foundation/release-tool-composition/).

If you want the standard `semantic-release` command and its default plugin profile, use the [`semantic-release` package](/usage/getting-started/) instead. It applies wrapper policies such as pull-request skipping and automatic dry-run behavior before calling core.

## Install

```sh
npm install @semantic-release/core
```

Your release tool should also declare the plugins and shareable configurations it uses as dependencies.

## Public API

The package exports a default release function and three helpers:

- `resolveConfig(context, runtimeOptions?, configOptions?)` resolves options and can build the plugin pipeline.
- `getLogger({ stdout, stderr })` creates the logger used by core and plugins.
- `resolveEnvCi({ env?, cwd? })` detects CI metadata for the current environment.

The default export runs one release. It accepts a required `context` and an explicit `plugins` input, with optional `onInit` and `formatOutput` callbacks. It returns `false` when no release is performed, or a result object when releases are published or added to a channel. An add-channel-only result may contain only `releases`.

Core handles release orchestration, configuration resolution, branch validation, Git operations, and plugin execution. The caller owns tool-specific policy, including CLI arguments, CI behavior, default plugin selection, and user-facing output.

## Create a release package

A reusable package can expose its own command or JavaScript API while using a shareable configuration to define release behavior. Let `resolveConfig` build that package's plugin pipeline:

```js title="release-tool.js"
import semanticRelease, {
  getLogger,
  resolveConfig,
  resolveEnvCi,
} from "@semantic-release/core";

export async function release({ cwd = process.cwd(), env = process.env } = {}) {
  const stdout = process.stdout;
  const stderr = process.stderr;
  const context = {
    cwd,
    env,
    envCi: resolveEnvCi({ cwd, env }),
    logger: getLogger({ stdout, stderr }),
    stdout,
    stderr,
  };

  const { options, plugins } = await resolveConfig(
    context,
    {},
    {
      buildPlugins: true,
      baseConfig: "@my-org/release-config",
    },
  );

  return semanticRelease({
    context: { ...context, options },
    plugins,
  });
}
```

The package can add its own configuration defaults or command-line handling before calling `release`. With `buildPlugins: true`, core resolves configuration and constructs the plugin pipeline for the run.

## Create a custom script

A script can resolve release options and pass an explicit plugin list. In this direct composition path, the `plugins` argument passed to core is authoritative:

```js title="release.mjs"
import semanticRelease, {
  getLogger,
  resolveConfig,
  resolveEnvCi,
} from "@semantic-release/core";

const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;
const context = {
  cwd,
  env,
  envCi: resolveEnvCi({ cwd, env }),
  logger: getLogger({ stdout, stderr }),
  stdout,
  stderr,
};

const { options } = await resolveConfig(
  context,
  { dryRun: env.RELEASE_DRY_RUN === "true" },
  { buildPlugins: false },
);

const result = await semanticRelease({
  context: { ...context, options },
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github",
  ],
});

if (result) {
  console.log(
    `Release run completed with ${result.releases.length} release action(s).`,
  );
}
```

Install and configure the plugins your tool needs. Core does not provide the default plugin profile from the `semantic-release` wrapper, and it does not automatically apply wrapper policies such as skipping pull requests or choosing dry-run mode.

## Choose a composition path

Use config-driven composition when a config file or shareable configuration should define the plugin pipeline. Use direct composition when the package or script must own plugin selection, for example to enforce required plugins or support a fixed workflow.

For a larger example, see [`monorepo-semantic-release`](https://github.com/semantic-release/monorepo-semantic-release), which composes core to plan and run releases for packages in a monorepo. For the conceptual model and how it relates to plugins and shareable configurations, see [Release Tool Composition](/foundation/release-tool-composition/).
