---
title: "CI Configuration"
---
Configure CI to run **semantic-release** by following two requirements: run it only after all tests pass, and configure the authentication needed to publish releases.

## Choose your CI Service

Start by choosing your CI service. Each guide shows provider-specific syntax for applying the same core requirements on this page.

- [GitHub Actions](/recipes/ci-configurations/github-actions)
- [GitLab CI](/recipes/ci-configurations/gitlab-ci)
- [CircleCI workflows](/recipes/ci-configurations/circleci-workflows)
- [Travis CI](/recipes/ci-configurations/travis)
- [Jenkins CI](/recipes/ci-configurations/jenkins-ci)

:::note
Whether your CI service is listed above or not, follow the same requirements below: [run `semantic-release` only after all tests succeeded](#run-semantic-release-only-after-all-tests-succeeded) and configure [authentication](#authentication). Then adapt those steps to your provider's syntax.

For details about the CI environment variables that **semantic-release** detects, see [env-ci](https://github.com/semantic-release/env-ci/).
:::

## Run `semantic-release` only after all tests succeeded

The `semantic-release` command must be executed only after all the tests in the CI build pass. If the build runs multiple jobs (for example to test on multiple Operating Systems or Node versions) the CI has to be configured to guarantee that the `semantic-release` command is executed only after all jobs are successful. 

## Authentication

**semantic-release** requires authentication to push to your repository and publish releases. Several authentication methods are available depending on your CI service and repository hosting platform.

:::note
Prefer short-lived credentials over long-lived secrets when your platform supports them (for example, OIDC-based trusted publishing or GitHub App installation tokens).
:::

### Push access to the remote repository

**semantic-release** requires push access to the project Git repository in order to create [Git tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging). The Git authentication can be set with one of the following environment variables:

| Variable                                              | Description                                                                                                                                                                                                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GH_TOKEN` or `GITHUB_TOKEN`                          | A GitHub token for repository authentication. Prefer the workflow-provided `GITHUB_TOKEN` or GitHub App installation token when available; use a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) only when required. _Note: In GitHub Actions, `GITHUB_TOKEN` is automatically provided by the runner._                                                                                                    |
| `GL_TOKEN` or `GITLAB_TOKEN`                          | A GitLab [personal access token](https://docs.gitlab.com/user/profile/personal_access_tokens/).                                                                                                                       |
| `BB_TOKEN` or `BITBUCKET_TOKEN`                       | A Bitbucket [personal access token](https://confluence.atlassian.com/bitbucketserver/personal-access-tokens-939515499.html).                                                                                                 |
| `BB_TOKEN_BASIC_AUTH` or `BITBUCKET_TOKEN_BASIC_AUTH` | A Bitbucket [personal access token](https://confluence.atlassian.com/bitbucketserver/personal-access-tokens-939515499.html) with basic auth support. For clarification `user:token` has to be the value of this env.         |
| `GIT_CREDENTIALS`                                     | [URL encoded](https://en.wikipedia.org/wiki/Percent-encoding) Git username and password in the format `<username>:<password>`. The username and password must each be individually URL encoded, not the `:` separating them. |

Alternatively the Git authentication can be set up via [SSH keys](/recipes/git-hosted-services/git-auth-ssh-keys).

For GitHub releases, see [@semantic-release/github authentication and permissions](https://github.com/semantic-release/github#github-authentication).

### Authentication for plugins

Most **semantic-release** [plugins](/usage/plugins) require setting up authentication in order to publish to a package manager registry. The default [@semantic-release/npm](https://github.com/semantic-release/npm#environment-variables) and [@semantic-release/github](https://github.com/semantic-release/github#environment-variables) plugins require the following environment variables:

| Variable    | Description                                                                                                                                                                                                                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NPM_TOKEN` | <p>npm token for publishing to npm. Trusted publishing is the preferred approach where supported, but some registries do not support it and still require a token. See <a href="/recipes/ci-configurations/">CI configuration recipes</a> for setup options.</p> |
| `GH_TOKEN`  | <p>GitHub authentication token for publishing releases. See <a href="/recipes/ci-configurations/">CI configuration recipes</a> for setup options.</p>                                                                                                                                                       |

See each plugin's documentation for the environment variables required.

The authentication token/credentials have to be made available in the CI service via environment variables.

See [CI configuration recipes](/recipes/ci-configurations/) for examples of how to configure environment variables in your CI service.

**Note**: The environment variables `GH_TOKEN`, `GITHUB_TOKEN`, `GL_TOKEN` and `GITLAB_TOKEN` can be used for both the Git authentication and the API authentication required by [@semantic-release/github](https://github.com/semantic-release/github) and [@semantic-release/gitlab](https://github.com/semantic-release/gitlab).
