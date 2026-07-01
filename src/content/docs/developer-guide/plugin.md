---
title: "Plugin development"
description: "Build semantic-release plugins by implementing lifecycle steps and handling release context safely."
---

To create a plugin for `semantic-release`, decide which [release steps](/foundation/release-steps/#step-sequence) your plugin needs to participate in by implementing the corresponding lifecycle hooks.

In practice, most plugins should implement at least the `verifyConditions` lifecycle hook so they can validate user input and fail early with a clear error. A plugin can implement any of the following lifecycle hooks:

- `verifyConditions`
- `analyzeCommits`
- `verifyRelease`
- `generateNotes`
- `addChannel`
- `prepare`
- `publish`
- `success`
- `fail`

`semantic-release` loads the plugin in Node.js and looks for exported functions whose names match lifecycle hooks. Those exported functions are your plugin's [lifecycle methods](#exposing-lifecycle-methods).

For example, exporting lifecycle methods named `verifyConditions` and `success` binds your plugin to the `verifyConditions` and `success` lifecycle hooks, which run during the **Verify Conditions** and **Notify** [release steps](/foundation/release-steps/#step-sequence) respectively.

When semantic-release calls a lifecycle method, it passes two arguments:

1. `pluginConfig` - plugin options from the user's [semantic-release configuration](/usage/configuration/#configuration-file) (for example, `release.config.js`)
2. `context` - runtime information from semantic-release, including environment variables and release metadata

As you add lifecycle methods, make sure each one accepts `pluginConfig` and `context` in its function signature.

## Creating a Plugin Project

Start by creating a new Node.js package with your preferred package manager, for example `npm init`, `pnpm init`, or `yarn init`. Then create an `index.js` file, set `"type": "module"` in `package.json`, and point your package entry to that file with `main` or `exports`. We will use `index.js` to expose the plugin lifecycle methods.

Next, create a `lib` folder in the root of the project. This is where the lifecycle implementation code will live. Finally, create a `test` folder so you can add automated tests for your plugin.

We recommend setting up linting so the plugin stays consistent and easy to maintain. ESLint is a common choice, but any tooling that fits your team is fine.

## Exposing Lifecycle Methods

In your `index.js` file, you can start with the following code:

```js title="index.js"
import verify from "./lib/verify.js";

let verified;

/**
 * Called by semantic-release during the Verify Conditions release step via the verifyConditions lifecycle hook
 * @param {*} pluginConfig The semantic-release plugin config
 * @param {*} context The context provided by semantic-release
 */
export async function verifyConditions(pluginConfig, context) {
  await verify(pluginConfig, context);
  verified = true;
}
```

Then, in your `lib` folder, create a file called `verify.js` and add the following:

```js title="verify.js"
import AggregateError from "aggregate-error";

/**
 * Verify that the plugin has the configuration it needs.
 */
export default async (pluginConfig, context) => {
  const { logger } = context;
  const errors = [];

  // Throw any errors we accumulated during the validation
  if (errors.length > 0) {
    throw new AggregateError(errors);
  }
};
```

As of right now, this code won't do anything. However, if you were to run this plugin via `semantic-release`, this `verifyConditions()` lifecycle method would run when semantic-release executes the **Verify Conditions** release step.

Following this structure, you can add other lifecycle methods and checks throughout the release process.

## Supporting Options

Let's say you want to verify that an option is passed. Plugin options are configured in the `plugins` array in the semantic-release configuration. For example:

```js title="release.config.js"
{
  plugins: [
    [
      "@semantic-release/my-special-plugin",
      {
        message: "My cool release message",
      },
    ],
  ];
}
```

That `message` value is passed to your plugin as part of `pluginConfig`. You can validate it in `verify.js` before using it later in the release process:

```js ins={2, 10, 12-21}
import AggregateError from "aggregate-error";
import SemanticReleaseError from "@semantic-release/error";

/**
 * Verify that the plugin has the configuration it needs.
 */
export default async (pluginConfig, context) => {
  const { logger } = context;
  const errors = [];
  const { message } = pluginConfig;

  if (!message) {
    // Add a SemanticReleaseError to AggregateError.
    errors.push(
      new SemanticReleaseError(
        "Missing `message` option.",
        "EMISSINGMESSAGE",
        "Add a `message` option to this plugin's entry in the `plugins` array.",
      ),
    );
  }

  // Throw any errors we accumulated during the validation
  if (errors.length > 0) {
    throw new AggregateError(errors);
  }
};
```

## Context

The `context` object is the runtime state that `semantic-release` builds and passes to every plugin lifecycle method during a release run. It gives your plugin access to release data (for example branch, commits, and next release info), execution details (for example `cwd` and `options`), integration values (for example `env` and CI metadata), and helper utilities such as `logger`.

Think of `context` as the shared source of truth for the current release execution: each lifecycle can read from it, and semantic-release may add more keys to it as the run progresses.

### Common context keys

The following keys are commonly available on `context` across lifecycle hooks:

- `stdout`: Writable stream for standard output.
- `stderr`: Writable stream for error output.
- `logger`: **semantic-release** logger
  - Available methods:
    - `log`
    - `warn`
    - `success`
    - `error`

### Context object keys by lifecycle hook

The `context` object evolves as semantic-release moves through each release step. Start with `verifyConditions` to see the baseline shape, then use the later lifecycle sections to understand which additional keys are available at that point in the run.

#### `verifyConditions`

Initially the context object contains the following keys for the `verifyConditions` lifecycle hook:

- `cwd` (String): Current working directory
- `env` (Object): Environment variables
- `envCi` (Object): Information about CI environment
  - Contains (at least) the following keys:
    - `isCi` (Boolean): `true` if the environment is a CI environment
    - `commit` (String): Commit hash
    - `branch` (String): Current branch
- `options` (Object): Options passed to `semantic-release` via CLI, configuration files etc.
- `branch` (Object): Information on the current branch
  - Object keys:
    - `channel` (String | null)
    - `tags` (Array)
    - `type` (String)
    - `name` (String)
    - `range` (String)
    - `accept` (Array)
    - `main` (Boolean)
- `branches` (Array): Information on branches
  - List of branch objects (see above)

#### `analyzeCommits`

The `analyzeCommits` lifecycle hook adds the following keys:

- `commits` (Array): List of commits considered when determining the next version.
  - Each commit object can include:
    - `commit` (Object): Commit hash metadata
      - `long` (String): Full commit hash
      - `short` (String): Short commit hash
    - `tree` (Object): Tree hash metadata
      - `long` (String): Full tree hash
      - `short` (String): Short tree hash
    - `author` (Object): Commit author information
      - `name` (String): Author name
      - `email` (String): Author email
      - `date` (String): ISO 8601 timestamp
    - `committer` (Object): Committer information
      - `name` (String): Committer name
      - `email` (String): Committer email
      - `date` (String): ISO 8601 timestamp
    - `subject` (String): Commit message subject
    - `body` (String): Commit message body
    - `hash` (String): Commit hash
    - `committerDate` (String): ISO 8601 timestamp
    - `message` (String): Full commit message
    - `gitTags` (String): Git tags associated with the commit
- `releases` (Array): List of releases created in the current run
- `lastRelease` (Object): Information about the most recent release
  - `version` (String): Version
  - `gitTag` (String): Git tag
  - `channels` (Array): List of channels
  - `gitHead` (String): Commit hash
  - `name` (String): Release name

#### `verifyRelease`

The `verifyRelease` lifecycle hook adds:

- `nextRelease` (Object): Information about the calculated next release
  - `type` (String): Release type
  - `channel` (String | null): Release channel
  - `gitHead` (String): Git hash
  - `version` (String): Version without `v`
  - `gitTag` (String): Version with `v`
  - `name` (String): Release name

#### `generateNotes`

When a plugin implements this hook (for example, `@semantic-release/release-notes-generator`), the `generateNotes` lifecycle hook populates a new key on `nextRelease` (Object):

- `nextRelease.notes` (String): Generated release notes.

#### `addChannel`

_This lifecycle runs only if there are releases merged from a higher branch that have not been added to the current branch channel._

Context content is similar to the `verifyRelease` lifecycle hook.

#### `prepare`

The `prepare` lifecycle hook does not add new context keys.

_It runs after `generateNotes`, so `nextRelease.notes` is available when it was populated by a `generateNotes` plugin._

#### `publish`

When a plugin implements this hook (for example, `@semantic-release/npm` or `@semantic-release/github`), the `publish` lifecycle hook can populate a new top-level context key:

- `releases` (Array): Release entries returned by `publish` plugins.

#### `success`

The `success` lifecycle hook runs only when the release execution completes successfully. In failure scenarios, semantic-release runs the `fail` lifecycle hook instead.

Available keys:

- `releases` (Array): Releases already populated during the `publish` lifecycle hook

#### `fail`

The `fail` lifecycle hook runs only when the release execution fails. In successful scenarios, semantic-release runs the `success` lifecycle hook instead.

Additional keys:

- `errors` (Array): Errors collected during the failed release execution

## Supporting Environment Variables

Similar to `options`, environment variables can be used for tokens and service-specific URLs. These values are available on `context`, not `pluginConfig`. For example, if your plugin needs `GITHUB_TOKEN` to call the GitHub API, you can check for it in your `verify` function:

```js
const { env } = context;

if (env.GITHUB_TOKEN) {
  //...
}
```

## Logger

Use `context.logger` to provide debug logging in the plugin. Available logging functions: `log`, `warn`, `success`, `error`.

```js
const { logger } = context;

logger.log("Some message from plugin.");
```

The above usage yields the following where `PLUGIN_PACKAGE_NAME` is automatically inferred.

```
[3:24:04 PM] [semantic-release] [PLUGIN_PACKAGE_NAME] › ℹ  Some message from plugin.
```

## Execution order

Release step order is defined in [Release Steps](/foundation/release-steps/#step-sequence). For lifecycle hooks implemented by multiple plugins, semantic-release executes those lifecycle methods in the order the plugins are declared in the `plugins` configuration.

## Handling errors

To be detected and handled properly, errors thrown by the plugin must be instances of [SemanticReleaseError](https://github.com/semantic-release/error) (or subclasses), as shown in the earlier `verify.js` validation example. If you need to report multiple validation problems at once, wrap those `SemanticReleaseError` instances in `AggregateError`. Other error types are treated as unexpected failures, bubble up to the final catch, and do not trigger `fail` plugins.

## Advanced

Knowledge that might be useful for plugin developers.

### Multiple `analyzeCommits` plugins

It is straightforward to define multiple plugins that implements the `analyzeCommits` hook, but it is less obvious that plugins executed after the first one (for example, the default `commit-analyzer`) can change the result. This makes it possible to create more advanced rules or fallback behavior, such as defining a default when none of the commits would produce a new release.

The returned value must be a known release type. For example, `commit-analyzer` recognizes the following default types:

- major
- premajor
- minor
- preminor
- patch
- prepatch
- prerelease

If an `analyzeCommits` lifecycle hook plugin does not return anything, the earlier result is used. If it returns a supported string value, that value overrides the previous result.
