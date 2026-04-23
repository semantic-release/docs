---
title: "CI Configuration"
---

## Run `semantic-release` only after all tests succeeded

The `semantic-release` command must be executed only after all the tests in the CI build pass. If the build runs multiple jobs (for example to test on multiple Operating Systems or Node versions) the CI has to be configured to guarantee that the `semantic-release` command is executed only after all jobs are successful. Here are a few examples of the CI services that can be used to achieve this:

- [Travis Build Stages](https://docs.travis-ci.com/user/build-stages)
- [CircleCI Workflows](https://circleci.com/docs/2.0/workflows)
- [GitHub Actions](https://github.com/features/actions)
- [GitLab Pipelines](https://docs.gitlab.com/ee/ci/pipelines/)
- [Codefresh Pipelines](https://codefresh.io/docs/docs/configure-ci-cd-pipeline/introduction-to-codefresh-pipelines)
- [GoCD Pipelines](https://docs.gocd.org/current/introduction/concepts_in_go.html#pipeline).

See [CI configuration recipes](../recipes/ci-configurations/) for more details.

## Authentication

### Push access to the remote repository

**semantic-release** requires push access to the project Git repository in order to create [Git tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging). The Git authentication can be set with one of the following environment variables:

| Variable                                              | Description                                                                                                                                                                                                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GH_TOKEN` or `GITHUB_TOKEN`                          | A GitHub [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).                                                                                                    |
| `GL_TOKEN` or `GITLAB_TOKEN`                          | A GitLab [personal access token](https://docs.gitlab.com/user/profile/personal_access_tokens/).                                                                                                                       |
| `BB_TOKEN` or `BITBUCKET_TOKEN`                       | A Bitbucket [personal access token](https://confluence.atlassian.com/bitbucketserver/personal-access-tokens-939515499.html).                                                                                                 |
| `BB_TOKEN_BASIC_AUTH` or `BITBUCKET_TOKEN_BASIC_AUTH` | A Bitbucket [personal access token](https://confluence.atlassian.com/bitbucketserver/personal-access-tokens-939515499.html) with basic auth support. For clarification `user:token` has to be the value of this env.         |
| `GIT_CREDENTIALS`                                     | [URL encoded](https://en.wikipedia.org/wiki/Percent-encoding) Git username and password in the format `<username>:<password>`. The username and password must each be individually URL encoded, not the `:` separating them. |

Alternatively the Git authentication can be set up via [SSH keys](/recipes/git-hosted-services/git-auth-ssh-keys).

### Authentication for plugins

Most **semantic-release** [plugins](/usage/plugins) require setting up authentication in order to publish to a package manager registry. The default [@semantic-release/npm](https://github.com/semantic-release/npm#environment-variables) and [@semantic-release/github](https://github.com/semantic-release/github#environment-variables) plugins require the following environment variables:

| Variable    | Description                                                                                                                                                                                                                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NPM_TOKEN` | <p>npm token created via <a href="https://docs.npmjs.com/creating-and-viewing-authentication-tokens">npm token create</a>.<br><strong>Note</strong>: Only the <code>auth-only</code> <a href="https://docs.npmjs.com/about-two-factor-authentication">level of npm two-factor authentication</a> is supported.</p> |
| `GH_TOKEN`  | <p>GitHub authentication token.<br><strong>Note</strong>: Only the <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens">personal token</a> authentication is supported.</p>                                                                                                                                                       |

See each plugin's documentation for the environment variables required.

The authentication token/credentials have to be made available in the CI service via environment variables.

See [CI configuration recipes](../recipes/ci-configurations/) for more details on how to configure environment variables in your CI service.

**Note**: The environment variables `GH_TOKEN`, `GITHUB_TOKEN`, `GL_TOKEN` and `GITLAB_TOKEN` can be used for both the Git authentication and the API authentication required by [@semantic-release/github](https://github.com/semantic-release/github) and [@semantic-release/gitlab](https://github.com/semantic-release/gitlab).
