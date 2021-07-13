const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/palenight');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Grid Engine',
  tagline: 'An exceptional plugin for grid-based features in the Phaser 3 engine.',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Annoraaq', // Usually your GitHub org/user name.
  projectName: 'grid-engine', // Usually your repo name.
  themeConfig: {
    navbar: {
      logo: {
        alt: 'Grid Engine',
        src: 'img/logo.svg',
      },
      items: [
        {
          href: 'https://github.com/Annoraaq/grid-engine',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Annoraaq. Built with Docusaurus.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/Annoraaq/grid-engine/edit/gh-pages/',
            routeBasePath: '/foo'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
