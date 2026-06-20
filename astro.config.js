// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import starlightPageContextAction from "starlight-page-context-action";

const VERCEL_PREVIEW_SITE =
  process.env.VERCEL_ENV !== "production" &&
  `https://${process.env.VERCEL_BRANCH_URL}`;

const site = VERCEL_PREVIEW_SITE || "https://semantic-release.org/";

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    starlight({
      title: "Semantic Release",
      logo: {
        light: "~/assets/sr-logo-light.svg",
        dark: "~/assets/sr-logo-dark.svg",
        replacesTitle: true,
        alt: "Semantic Release",
      },
      editLink: {
        baseUrl: "https://github.com/semantic-release/docs/edit/main/",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/semantic-release/semantic-release",
        },
      ],
      customCss: ["./src/styles/global.css"],
      components: {
        Hero: "~/components/Hero.astro",
        Header: "~/components/Header.astro",
        Head: "~/components/Head.astro",
      },
      sidebar: [
        {
          label: "Introduction",
          slug: "intro",
        },
        {
          label: "Usage",
          items: [
            { slug: "usage/getting-started" },
            { slug: "usage/configuration" },
            { slug: "usage/ci-configuration" },
            { slug: "usage/running" },
          ],
        },
        {
          label: "Foundations",
          items: [
            { slug: "foundation", label: "Overview" },
            { slug: "foundation/how-it-works" },
            { slug: "foundation/release-steps" },
            { slug: "foundation/considerations" },
            { slug: "foundation/supported-branching" },
            { slug: "foundation/workflow-configuration" },
            { slug: "foundation/plugins" },
            { slug: "foundation/shareable-configurations" },
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
                { slug: "recipes/ci-configurations", label: "Overview" },
                { slug: "recipes/ci-configurations/github-actions" },
                { slug: "recipes/ci-configurations/gitlab-ci" },
                {
                  slug: "recipes/ci-configurations/circleci-workflows",
                  label: "CircleCI Workflows",
                },
                { slug: "recipes/ci-configurations/travis" },
                { slug: "recipes/ci-configurations/jenkins-ci" },
              ],
            },
            {
              label: "Git Hosted Services",
              items: [
                { slug: "recipes/git-hosted-services", label: "Overview" },
                { slug: "recipes/git-hosted-services/git-auth-ssh-keys" },
              ],
            },
            {
              label: "Release Workflow",
              items: [
                { slug: "recipes/release-workflow", label: "Overview" },
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
      plugins: [
        starlightPageContextAction({
          position: "below-toc",
          sticky: true,
        }),
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
