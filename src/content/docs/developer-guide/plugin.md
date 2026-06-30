---
title: "Plugin development"
description: "Build semantic-release plugins by implementing lifecycle steps and handling release context safely."
---

To create a plugin for `semantic-release`, decide which [parts of the release lifecycle](/foundation/release-steps/#step-sequence) your plugin needs to participate in by implementing/binding to its hook.

In practice, most plugins should implement at least `verifyConditions` hook so they can validate user input and fail early with a clear error. A plugin can implement/bind any of the following lifecycle hooks:

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

For example, exporting `verifyConditions` and `success` binds your plugin to the `verifyConditions` and `success` hooks of the **Verify Conditions** and **Notify** [release steps](/foundation/release-steps/#step-sequence) respectively.

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
 * Called by semantic-release during the verify conditions step
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

As of right now, this code won't do anything. However, if you were to run this plugin via `semantic-release`, it would run when the `verify` step occurred.

Following this structure, you can add other lifecycle methods and checks throughout the release process.

## Supporting Options

Let's say you want to verify that an option is passed. Plugin options are configured in the `plugins` array in the semantic-release configuration. For example:

```js title="release.config.js"
{
  plugins: [
    [
      "@semantic-release/my-special-plugin", 
      {
        message: "My cool release message"
      }
    ]
  ]
}
```

That `message` value is passed to your plugin as part of `pluginConfig`. You can validate it in `verify.js` before using it later in the release process:

```js ins={2, 10, 12-21}
import AggregateError from "aggregate-error";
import SemanticReleaseError from "@semantic-release/error"

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

### Common context keys

- `stdout`
- `stderr`
- `logger`

### Context object keys by lifecycle

#### verifyConditions

Initially the context object contains the following keys (`verifyConditions` lifecycle):

- `cwd`
  - Current working directory
- `env`
  - Environment variables
- `envCi`
  - Information about CI environment
  - Contains (at least) the following keys:
    - `isCi`
      - Boolean, true if the environment is a CI environment
    - `commit`
      - Commit hash
    - `branch`
      - Current branch
- `options`
  - Options passed to `semantic-release` via CLI, configuration files etc.
- `branch`
  - Information on the current branch
  - Object keys:
    - `channel`
    - `tags`
    - `type`
    - `name`
    - `range`
    - `accept`
    - `main`
- `branches`
  - Information on branches
  - List of branch objects (see above)

#### analyzeCommits

Compared to the verifyConditions, `analyzeCommits` lifecycle context has keys

- `commits` (List)
  - List of commits taken into account when determining the new version.
  - Keys:
    - `commit` (Object)
      - Keys:
        - `long` (String, Commit hash)
        - `short` (String, Commit hash)
    - `tree` (Object)
      - Keys:
        - `long` (String, Commit hash)
        - `short` (String, Commit hash)
    - `author` (Object)
      - Keys:
        - `name` (String)
        - `email` (String)
        - `date` (String, ISO 8601 timestamp)
    - `committer` (Object)
      - Keys:
        - `name` (String)
        - `email` (String)
        - `date` (String, ISO 8601 timestamp)
    - `subject` (String, Commit message subject)
    - `body` (String, Commit message body)
    - `hash` (String, Commit hash)
    - `committerDate` (String, ISO 8601 timestamp)
    - `message` (String)
    - `gitTags` (String, List of git tags)
- `releases` (List)
- `lastRelease` (Object)
  - Keys
    - `version` (String)
    - `gitTag` (String)
    - `channels` (List)
    - `gitHead` (String, Commit hash)
    - `name` (String)

#### verifyRelease

Additional keys:

- `nextRelease` (Object)
  - `type` (String)
  - `channel` (String)
  - `gitHead` (String, Git hash)
  - `version` (String, version without `v`)
  - `gitTag` (String, version with `v`)
  - `name` (String)

#### generateNotes

No new content in the context.

#### addChannel

_This is run only if there are releases that have been merged from a higher branch but not added on the channel of the current branch._

Context content is similar to lifecycle `verifyRelease`.

#### prepare

Only change is that `generateNotes` has populated `nextRelease.notes`.

#### publish

No new content in the context.

#### success

Lifecycles `success` and `fail` are mutually exclusive, only one of them will be run.

Additional keys:

- `releases`
  - Populated by `publish` lifecycle

#### fail

Lifecycles `success` and `fail` are mutually exclusive, only one of them will be run.

Additional keys:

- `errors`

### Supporting Environment Variables

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

For the lifecycles, the list at the top of the readme contains the order. If there are multiple plugins for the same lifecycle, then the order of the plugins determines the order in which they are executed.

## Handling errors

To be detected and handled properly, errors thrown by the plugin must be of type [SemanticReleaseError](https://github.com/semantic-release/error) or extend it as described in that package's README. If you need to report multiple validation problems at once, wrap those `SemanticReleaseError` instances in `AggregateError`. Other error types are treated as unexpected failures, bubble up to the final catch, and do not trigger `fail` plugins.

## Advanced

Knowledge that might be useful for plugin developers.

### Multiple analyzeCommits plugins

While it may be trivial that multiple analyzeCommits (or any lifecycle plugins) can be defined, it is not that self-evident that the plugins executed AFTER the first one (for example, the default one: `commit-analyzer`) can change the result. This way it is possible to create more advanced rules or situations, e.g. if none of the commits would result in new release, then a default can be defined.

The commit must be a known release type, for example the commit-analyzer has the following default types:

- major
- premajor
- minor
- preminor
- patch
- prepatch
- prerelease

If the analyzeCommits-lifecycle plugin does not return anything, then the earlier result is used, but if it returns a supported string value, then that overrides the previous result.
