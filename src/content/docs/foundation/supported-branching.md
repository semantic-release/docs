---
title: Supported Branching Models
---

This page summarizes branching models that align well with **semantic-release** and those that are officially unsupported.

:::tip[Recommendation] 
Default to workflows that keep changes flowing to a stable trunk quickly and continuously.
:::

## Supported Branching Models

These models align with the delivery and release assumptions built into **semantic-release**.

### Trunk-Based Development

- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [MinimumCD: Trunk-Based Development](https://minimumcd.org/minimumcd/tbd/)

#### Committing Straight to Trunk

- [Trunk-Based Development for Smaller Teams](https://trunkbaseddevelopment.com/#trunk-based-development-for-smaller-teams)
- [Committing Straight to the Trunk](https://trunkbaseddevelopment.com/committing-straight-to-the-trunk/)

#### Short-Lived Feature Branches

- [Scaled Trunk-Based Development](https://trunkbaseddevelopment.com/#scaled-trunk-based-development)
- [Short-Lived Feature Branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/)

#### Continuous Integration

- [MinimumCD: Continuous Integration](https://minimumcd.org/minimumcd/ci/)

#### Continuous Deployment/Release

- [Continuous Deployment](https://trunkbaseddevelopment.com/continuous-delivery/#continuous-deployment)

:::tip[Recommendation] 
Choose a trunk-based workflow that keeps branch lifetime short and integration frequent.
:::

### GitHub Flow

- [GitHub Docs: GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [GitHub Flow](https://githubflow.github.io/)

:::tip[Recommendation] 
GitHub Flow is a practical fit when pull requests are short-lived and releases are frequent.
:::

## Officially Unsupported Branching Models

These models conflict with the default expectations of **semantic-release** and are not supported by the project team.

### Trunk-Based Development: Branch for Release

- [Branch for Release](https://trunkbaseddevelopment.com/branch-for-release/)

Exception:

- [Late Creation of Release Branches](https://trunkbaseddevelopment.com/branch-for-release/#late-creation-of-release-branches) - _our maintenance release is an example of this approach_

### Git Flow: Long-Lived Branch Orchestration (develop/release/hotfix)

- [A Successful Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/)
- [Why You Should Not Use Git Flow](https://jeffkreeftmeijer.com/git-flow/)

Even if this is a strategy that you find useful for the applications you are building, [the original author of the git-flow branching model recommends against it](https://nvie.com/posts/a-successful-git-branching-model/) for that context,
we do not recommend this long-lived branch orchestration pattern when releasing artifacts with **semantic-release**.
While the [same reflection](https://nvie.com/posts/a-successful-git-branching-model/) that recommends against using git-flow for web apps suggests that it may still be a good fit for explicitly versioned software,
**semantic-release** is built with Continuous Deployment/Release in mind instead.

While some have found that the [Pre-release workflow](/foundation/workflow-configuration/#prerelease) enabled by **semantic-release** can be used to _simulate_ a git-flow-like workflow,
it is also worth noting that this orchestration pattern is not an intended use case and requests for support when attempting to use it that way will be closed by our team.

:::tip[Recommendation] 
Avoid Git flow-style long-lived branch orchestration when using **semantic-release**.
:::

### Workflows that Release for Testing Before Promotion to a Stable Release

- [The Importance of a Local Build](https://trunkbaseddevelopment.com/styles/#the-importance-of-a-local-build)

:::tip[Recommendation] 
Prefer workflows where confidence comes from CI quality signals, with production release as the promotion event.
:::

### Monorepos

While monorepos are not specifically a branching strategy, they are also not an officially supported **semantic-release** setup at this time.
That said, the same branching and release principles described on this page still apply to releasable artifacts in a monorepo.
For teams that choose this approach, community plugins can enable monorepo support for now.
