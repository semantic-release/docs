---
title: "Running semantic-release"
description: "Run semantic-release locally or in CI, understand dry runs, and interpret release logs."
---

How to run **semantic-release** in your CI pipeline using `npx`, including version pinning strategies and tradeoffs of local installation.

## Using npx (recommended)

We recommend running **semantic-release** directly in the CI environment with [npx](/support/faq#what-is-npx):

```sh
npx semantic-release
```

If you need to leverage plugins and/or presets that are not included in the base **semantic-release** package, you can include them as part of your `npx` command as well:

```sh
npx --package semantic-release --package @semantic-release/exec --package conventional-changelog-conventionalcommits semantic-release
```

### Notes

1. When running **semantic-release** with `npx`, we recommend setting at least the major version. For example, by using `npx semantic-release@25`. This way you control which major version of **semantic-release** is used by your pipeline, and thus avoid breaking the release when there's a new major version of **semantic-release**.
2. Pinning **semantic-release** to an exact version makes your releases even more deterministic. But pinning also means you, or a bot, must upgrade **semantic-release** when a new version is released.
3. You can use [Renovate's regex manager](https://docs.renovatebot.com/modules/manager/regex/) to get automatic updates for **semantic-release** in either of the above scenarios. Put this in your Renovate configuration file:

   ```json
   {
     "customManagers": [
       {
         "customType": "regex",
         "description": "Update semantic-release version used by npx",
         "managerFilePatterns": ["^\\.github/workflows/[^/]+\\.ya?ml$"],
         "matchStrings": [
           "\\srun: npx semantic-release@(?<currentValue>.*?)\\s"
         ],
         "datasourceTemplate": "npm",
         "depNameTemplate": "semantic-release"
       }
     ]
   }
   ```

4. `npx` is a tool bundled with `npm@>=5.2.0`. You can use it to download and run the **semantic-release** binary in a single step. See [What is npx](/support/faq#what-is-npx) for more details.

## Local installation (not recommended)

Since **semantic-release** isn't truly a development dependency, but rather a release dependency, we recommend against installing it as a local dependency of your project. Instead, we recommend running it in your CI environment with [npx](/support/faq#what-is-npx) as described [above](#using-npx-recommended). Running only during the release process avoids:

- installing unnecessary dependencies during development and testing, including the fairly sizable dependency on **npm**
- installing a different version of **npm** into `node_modules/` than the one used to run the release, which can lead to conflicts and unexpected behavior
- installing dependencies that could conflict with other development dependencies, like **commitlint**

:::note
A tradeoff of running via `npx` instead of installing locally is that the full **semantic-release** dependency graph is not pinned by your project's lockfile.

The [version pinning strategies](#notes) above help mitigate this.
:::
