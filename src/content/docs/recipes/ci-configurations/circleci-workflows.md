---
title: "CircleCI 2.0"
description: "Set up semantic-release on CircleCI 2.0 with trusted publishing or secure tokens and a reliable release job pipeline."
---

Use this recipe to run semantic-release on CircleCI with a secure default setup. It covers authentication options, trusted publishing with OIDC and npm provenance, a minimal release workflow for Node projects, and common pitfalls to avoid when configuring npm and GitHub tokens.

## Quick start

### Choose a publishing path

#### Path A (recommended): Trusted publishing (OIDC)

- No long-lived `NPM_TOKEN` in CircleCI environment variables.
- npm provenance is generated automatically.
- Requires an npm [Trusted Publisher](https://docs.npmjs.com/trusted-publishers#for-circleci-1) configured for the workflow that triggers the run.
- Long-lived `GITHUB_TOKEN` used for GitHub release notes, issue comments, and pull request comments.

#### Path B (fallback): `NPM_TOKEN`

- Long-lived `NPM_TOKEN` in CircleCI environment variables.
- No npm provenance.
- Use this only when trusted publishing is not available for your setup.
- Long-lived `GITHUB_TOKEN` used for GitHub release notes, issue comments, and pull request comments.

### Node project configuration

#### Trusted publishing (OIDC)

Follow the official [Publish to npm using OIDC trusted publishing](https://circleci.com/docs/guides/deploy/deploy-to-npm-registry/) guide from CircleCI and simply use `npx semantic-release` instead of `npm publish` in your `.circleci/config.yml` like so:

```yaml
version: 2.1

jobs:
  publish:
    docker:
      - image: cimg/node:22.14
    steps:
      - checkout
      - run:
          name: Install dependencies
          command: npm ci
      - run:
          name: Run tests
          command: npm test
      - run:
          name: Build
          command: npm run build --if-present
      - run:
          name: Publish to npm
          command: |
            export NPM_ID_TOKEN=$(circleci run oidc get --claims '{"aud": "npm:registry.npmjs.org"}')
            npx semantic-release # <- The Run Commnand, instead of `npm publish`

workflows:
  publish:
    jobs:
      - publish:
          filters: pipeline.git.branch == "main" # only run the publish job on the main branch
```

Additional [Authentication](/usage/ci-configuration#authentication) environment variables (like `GITHUB_TOKEN`) can be configured in [CircleCi Project Settings](https://circleci.com/docs/2.0/env-vars/#adding-environment-variables-in-the-app).

#### `NPM_TOKEN`

Follow the official [Publish to npm with an authentication token](https://circleci.com/docs/guides/deploy/deploy-to-npm-registry-with-token/) guide from CircleCI and simply use `npx semantic-release` instead of `npm publish` in your `.circleci/config.yml` like so:

```yaml
version: 2.1

jobs:
  publish:
    docker:
      - image: <docker-image-name-tag>
    steps:
      - checkout
      - run:
          name: Publish to NPM
          command: |
            npm set //registry.npmjs.org/:_authToken=$NPM_TOKEN
            npx semantic-release # <- The Run Commnand, instead of `npm publish`

workflows:
  tagged-build:
    jobs:
      - publish:
          filters: pipeline.git.tag matches /^v[0-9]+(\.[0-9]+)*$/ # only run the publish job on version tags
```

The [Authentication](/usage/ci-configuration#authentication) environment variables can be configured in [CircleCi Project Settings](https://circleci.com/docs/2.0/env-vars/#adding-environment-variables-in-the-app).
Alternatively, the default `NPM_TOKEN` and `GH_TOKEN` can be easily [setup with semantic-release-cli](/usage/getting-started).

## Multiple Node jobs configuration

### `.circleci/config.yml` configuration for multiple Node jobs

This example is a minimal configuration for **semantic-release** with tests running against Node 16 and 14. See [CircleCI documentation](https://circleci.com/docs/2.0) for additional configuration options.

In this example, the [`circleci/node`](https://circleci.com/developer/orbs/orb/circleci/node) orb is imported (Which makes some node operations easier), then a `release` job is defined which will run `semantic-release`.

To run our `release` job, we have created a workflow named `test_and_release` which will run two jobs, `node/test`, which comes from the node orb and will test our application, and our release job. Here, we are actually making use of [matrix jobs](https://circleci.com/blog/circleci-matrix-jobs/) so that our single `node/test` job will actually be executed twice, once for Node version 16, and once for version 14. Finally, we call our release job with a `requires` parameter so that `release` will run against the latest LTS version of node, only after `node/test` has successfully tested against v14 and v16.

```yaml
version: 2.1
orbs:
  node: circleci/node@5.0.0
jobs:
  release:
    executor: node/default
    steps:
      - checkout
      - node/install-packages # Install and automatically cache packages
      # Run optional required steps before releasing
      # - run: npm run build-script
      - run: npx semantic-release

workflows:
  test_and_release:
    # Run the test jobs first, then the release only when all the test jobs are successful
    jobs:
      - node/test:
          matrix:
            parameters:
              version:
                - 16.1.0
                - 14.17.0
      - release:
          requires:
            - node/test
```
