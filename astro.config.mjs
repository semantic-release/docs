// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'semantic-release',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/semantic-release/semantic-release' }],
			sidebar: [
				{
					label: 'Usage',
					autogenerate: { directory: 'usage' },
				},
				{
					label: 'Extending',
					autogenerate: { directory: 'extending' },
				},
				{
					label: 'Recipes',
					items: [
						{
							label: 'CI Configurations',
							autogenerate: { directory: 'recipes/ci-configurations' },
						},
						{
							label: 'Git Hosted Services',
							autogenerate: { directory: 'recipes/git-hosted-services' },
						},
						{
							label: 'Release Workflow',
							autogenerate: { directory: 'recipes/release-workflow' },
						},
					],
				},
				{
					label: 'Developer Guide',
					autogenerate: { directory: 'developer-guide' },
				},
				{
					label: 'Support',
					autogenerate: { directory: 'support' },
				},
			],
		}),
	],
});
