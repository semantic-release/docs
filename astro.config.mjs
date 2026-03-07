// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Semantic Release",
      logo: {
        light: "./src/assets/sr-logo-light.svg",
        dark: "./src/assets/sr-logo-dark.svg",
        replacesTitle: true,
        alt: "Semantic Release",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/semantic-release/semantic-release",
        },
      ],
      sidebar: [
        {
          label: "Introduction",
          slug: "intro",
        },
        {
          label: "Usage",
          items: [
            { slug: "usage/getting-started" },
            { slug: "usage/installation" },
            { slug: "usage/ci-configuration" },
            { slug: "usage/configuration" },
            { slug: "usage/plugins" },
            { slug: "usage/workflow-configuration" },
            { slug: "usage/shareable-configurations" },
          ],
        },
        {
          label: "Extending",
          items: [
            { slug: "extending/plugins-list" },
            { slug: "extending/shareable-configurations-list" },
          ],
        },
        {
          label: "Recipes",
          items: [
            {
              label: "CI Configurations",
              items: [
                { slug: "recipes/ci-configurations" },
                { slug: "recipes/ci-configurations/circleci-workflows" },
                { slug: "recipes/ci-configurations/travis" },
                { slug: "recipes/ci-configurations/gitlab-ci" },
                { slug: "recipes/ci-configurations/github-actions" },
                { slug: "recipes/ci-configurations/jenkins-ci" },
              ],
            },
            {
              label: "Git Hosted Services",
              items: [
                { slug: "recipes/git-hosted-services" },
                { slug: "recipes/git-hosted-services/git-auth-ssh-keys" },
              ],
            },
            {
              label: "Release Workflow",
              items: [
                { slug: "recipes/release-workflow" },
                { slug: "recipes/release-workflow/distribution-channels" },
                { slug: "recipes/release-workflow/maintenance-releases" },
                { slug: "recipes/release-workflow/pre-releases" },
              ],
            },
          ],
        },
        {
          label: "Developer Guide",
          items: [
            { slug: "developer-guide/js-api" },
            { slug: "developer-guide/plugin" },
            { slug: "developer-guide/shareable-configuration" },
          ],
        },
        {
          label: "Support",
          items: [
            { slug: "support/resources" },
            { slug: "support/faq" },
            { slug: "support/troubleshooting" },
            { slug: "support/node-version" },
            { slug: "support/node-support-policy" },
            { slug: "support/git-version" },
          ],
        },
      ],
    }),
  ],
});
