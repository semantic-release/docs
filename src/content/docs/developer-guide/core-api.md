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

| Export                                                    | Purpose                                                           |
| --------------------------------------------------------- | ----------------------------------------------------------------- |
| `semanticReleaseCore(input)`                              | Run one release using a context and explicit plugin input.        |
| `resolveConfig(context, runtimeOptions?, configOptions?)` | Resolve release options and optionally build the plugin pipeline. |
| `getLogger({ stdout, stderr })`                           | Create the logger used by core and plugins.                       |
| `resolveEnvCi({ env?, cwd? })`                            | Detect CI metadata for an environment and working directory.      |

### Default export

Core verifies the required context fields, applies missing Git environment defaults, invokes `onInit`, normalizes plugin input, and runs the release lifecycle. It handles release orchestration, configuration resolution, branch validation, Git operations, and plugin execution. The caller owns tool-specific policy such as CLI arguments, pull-request handling, dry-run selection, default plugin profiles, and user-facing output.

```ts
semanticReleaseCore(input: {
  context: VerifyConditionsContext & { options: Options };
  plugins: PluginsInput;
  onInit?: (context: VerifyConditionsContext) => Promise<void> | void;
  formatOutput?: OutputFormatter;
}): Promise<Result>
```

| Input          | Required | Description                                                                                                                                                                  |
| -------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context`      | Yes      | Runtime state for the release. `context.options` must contain the resolved semantic-release options. See [Context fields](#context-fields).                                  |
| `plugins`      | Yes      | Either plugin specifications for core to normalize or a complete plugin pipeline. See [Plugin input](#plugin-input).                                                         |
| `onInit`       | No       | Callback invoked with the context before core normalizes plugins and starts the release run.                                                                                 |
| `formatOutput` | No       | Synchronous or asynchronous formatter for markdown written to output streams, including release notes and semantic-release error details. Defaults to an identity formatter. |

#### Context Fields

The core runtime requires these fields on `context` when calling the default export:

| Field     | Required at runtime | Description                                                                                                                                          |
| --------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options` | Yes                 | Resolved release and plugin options.                                                                                                                 |
| `envCi`   | Yes                 | CI metadata, normally from `resolveEnvCi`.                                                                                                           |
| `logger`  | Yes                 | Logger, normally from `getLogger`.                                                                                                                   |
| `stdout`  | Yes                 | Writable stream for regular output.                                                                                                                  |
| `stderr`  | Yes                 | Writable stream for errors and warnings.                                                                                                             |
| `cwd`     | Recommended         | Repository working directory used for configuration and Git operations.                                                                              |
| `env`     | Recommended         | Environment passed to configuration loading and Git operations. Core fills in missing Git identity and non-interactive prompt values on this object. |

The declarations type the default export's context as already containing `branch` and `branches`. At runtime, core calculates those fields during the run, after calling `onInit`; do not rely on them inside `onInit`.

##### Context data by lifecycle hook

The `context` object accumulates release data as **semantic-release** advances through its lifecycle. For common context fields and the additional fields available to plugins at each hook, see [Context object keys by lifecycle hook](/developer-guide/plugin/#context-object-keys-by-lifecycle-hook) in the Plugin Development guide.

#### Plugin Input

`plugins` can be an array of plugin specifications or a complete pipeline with a function for every lifecycle hook.

| Form                      | Example                                                                                                                                                          | Description                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Package name              | `"@semantic-release/npm"`                                                                                                                                        | Load a plugin package from the release project or its configuration dependencies. |
| Package and options tuple | `["@semantic-release/npm", { "npmPublish": false }]`                                                                                                             | Load a plugin and pass it a plugin-specific options object.                       |
| Plugin object             | `{ path: "@semantic-release/npm", npmPublish: false }`                                                                                                           | Set the package path and plugin options together.                                 |
| Inline plugin             | `{ verifyConditions: async (pluginConfig, context) => {} }`                                                                                                      | Provide lifecycle methods directly as functions.                                  |
| Normalized pipeline       | An object containing `verifyConditions`, `analyzeCommits`, `verifyRelease`, `generateNotes`, `prepare`, `publish`, `addChannel`, `success`, and `fail` functions | Pass a pipeline that has already been assembled; core uses it as provided.        |

When core normalizes plugin specifications, it injects `@semantic-release/commit-analyzer` for `analyzeCommits` if no plugin provides that hook and `options.analyzeCommits` is not itself a plugin specification. An options-only `options.analyzeCommits` object is merged into the fallback plugin. A supplied complete pipeline is not normalized and does not receive fallback injection.

#### Return value and errors

| Runtime outcome                                | Value                                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------------------- |
| No release and no channel-add action           | `false`                                                                       |
| A release is published                         | An object containing `lastRelease`, `commits`, `nextRelease`, and `releases`. |
| Only an existing release is added to a channel | An object containing `releases`.                                              |

The declarations describe `Result` as `false` or the full release object. The runtime can return the smaller `{ releases }` object for an add-channel-only run.

Core rejects missing required context fields, missing `plugins`, and a non-function `formatOutput`. Release errors are logged and rethrown. For semantic-release errors raised during the release run, core invokes the `fail` plugin with the collected errors before rethrowing.

### `resolveConfig`

```ts
resolveConfig(
  context: { cwd: string; env: Record<string, any> },
  runtimeOptions?: Options,
  configOptions?: {
    buildPlugins?: boolean;
    baseConfig?: string | Record<string, any>;
  },
): Promise<{ options: Options; plugins?: PluginsPipeline }>
```

| Parameter                    | Description                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `context`                    | Requires `cwd` and `env`. When building plugins, also provide the full runtime context, including `envCi`, `logger`, `stdout`, and `stderr`. |
| `runtimeOptions`             | Caller-supplied release and plugin options. These take precedence over discovered configuration.                                             |
| `configOptions.buildPlugins` | Defaults to `false`. When `true`, resolve and normalize the plugin pipeline and return it as `plugins`. When `false`, resolve options only.  |
| `configOptions.baseConfig`   | Optional base configuration as a module/file name or a plain object.                                                                         |

#### Configuration layers

For a setting defined at more than one level, the higher layer wins:

1. Core defaults fill values not supplied elsewhere.
2. Shareable configurations from `extends` are merged in order; later entries override earlier entries.
3. `baseConfig` overrides values from shareable configurations.
4. The discovered `release` configuration file overrides `baseConfig` and shareable configurations.
5. `runtimeOptions` overrides all configuration sources.

Core removes `null` and `undefined` values before applying defaults. The default repository URL comes from the package's `repository` field or the Git origin; default branches and tag format are applied when not configured.

#### Release options

These are the main core options. Options supported by plugins can also be supplied; core passes plugin options to the corresponding lifecycle methods.

| Group             | Option          | Type                           | Core behavior                                                                                                                                                 |
| ----------------- | --------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release selection | `branches`      | `BranchSpec` or array          | Defaults to the standard `main`/`master`, maintenance, `next`, `next-major`, `beta`, and `alpha` branch definitions.                                          |
| Release selection | `repositoryUrl` | `string`                       | Defaults to the package repository URL or Git origin.                                                                                                         |
| Release selection | `tagFormat`     | `string`                       | Defaults to `v${version}`. Must render a valid Git reference and include `version` exactly once.                                                              |
| Configuration     | `extends`       | string or array of strings     | Loads shareable configurations in order.                                                                                                                      |
| Plugin pipeline   | `plugins`       | array of plugin specifications | Used by `resolveConfig` when building plugins. The core-built default list contains the commit analyzer; it is not the wrapper's full default plugin profile. |
| Execution         | `dryRun`        | `boolean`                      | Skips publishing side effects when true. Core does not choose dry-run automatically based on whether the run is in CI.                                        |
| Execution         | `ci`            | `boolean`                      | Setting this to `false` causes core to set `noCi: true` for CI verification behavior.                                                                         |
| Execution         | `noCi`          | `true`                         | Set by core when `ci` is explicitly `false`; normally callers set `ci` instead.                                                                               |
| Plugin-specific   | Plugin-defined  | Varies                         | Additional option names are accepted and made available to the matching plugin.                                                                               |

The standard configuration guide describes the shared meanings of [branches](/usage/configuration/#branches), [repositoryUrl](/usage/configuration/#repositoryurl), [tagFormat](/usage/configuration/#tagformat), and [plugins](/usage/configuration/#plugins). Core does not add the wrapper's automatic local dry-run or default plugin profile.

### `getLogger`

```ts
getLogger(input: {
  stdout: NodeJS.WriteStream;
  stderr: NodeJS.WriteStream;
}): Signale
```

Both streams are required; core does not substitute `process.stdout` or `process.stderr`. The logger routes regular messages to `stdout` and warnings/errors to `stderr`. It provides `log`, `warn`, `success`, `error`, `start`, `skip`, and `complete` methods.

### `resolveEnvCi`

```ts
resolveEnvCi(input: {
  env?: Record<string, any>;
  cwd?: string;
}): EnvCi & Record<string, any>
```

`env` defaults to `process.env` and `cwd` defaults to `process.cwd()`. The returned object includes CI state such as `isCi`, `commit`, and `branch`; CI providers may add further metadata. Pass the result as `context.envCi`. If your release tool implements policies such as skipping pull requests, inspect the provider metadata in the context and apply that policy in the tool layer.

## Composing a release tool

A release tool can be a reusable package or a script for a specific workflow. Both forms call the same core API; they differ mainly in how they expose the workflow and choose its configuration and plugins.

### Create a release package

A reusable package can expose its own command or JavaScript API while using a shareable configuration to define release behavior. Let `resolveConfig` build that package's plugin pipeline:

```js title="release-tool.js"
import semanticReleaseCore, {
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

  return semanticReleaseCore({
    context: { ...context, options },
    plugins,
  });
}
```

The package can add its own configuration defaults or command-line handling before calling `release`. With `buildPlugins: true`, core resolves configuration and constructs the plugin pipeline for the run.

### Create a custom script

A script can resolve release options and pass an explicit plugin list. In this direct composition path, the `plugins` argument passed to core is authoritative:

```js title="release.mjs"
import semanticReleaseCore, {
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

const result = await semanticReleaseCore({
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

### Choose a composition path

Use config-driven composition when a config file or shareable configuration should define the plugin pipeline. Use direct composition when the package or script must own plugin selection, for example to enforce required plugins or support a fixed workflow.

For a larger example, see [`monorepo-semantic-release`](https://github.com/semantic-release/monorepo-semantic-release), which composes core to plan and run releases for packages in a monorepo. For the conceptual model and how it relates to plugins and shareable configurations, see [Release Tool Composition](/foundation/release-tool-composition/).
