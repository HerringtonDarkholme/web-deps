import type { Tool, Edge, ToolCategory, GraphData } from './types';

// Define categories with their levels and colors (Vercel-inspired palette)
export const categories: ToolCategory[] = [
  { id: 'metaframework', name: 'Meta Framework', level: 1, color: '#0070f3' },
  { id: 'framework', name: 'Framework', level: 2, color: '#00bcd4' },
  { id: 'library', name: 'Library', level: 3, color: '#f81ce5' },
  { id: 'bundler', name: 'Bundler', level: 4, color: '#ff6600' },
  { id: 'linter', name: 'Linter', level: 5, color: '#ffd93d' },
  { id: 'formatter', name: 'Formatter', level: 5, color: '#6bcf7f' },
  { id: 'minimizer', name: 'Minimizer', level: 5, color: '#ff4757' },
  { id: 'compiler', name: 'Compiler', level: 6, color: '#06ffa5' },
  { id: 'parser', name: 'Parser', level: 6, color: '#1fb6ff' },
  { id: 'runtime', name: 'Runtime', level: 7, color: '#4d4d4d' },
  { id: 'testing', name: 'Testing', level: 3, color: '#5f27cd' },
  { id: 'language-tool', name: 'Language Tool', level: 3, color: '#00d2d3' },
];

function normalizeName(str: string) {
  return str.toLowerCase().replace(/\s|\//g, '');
}

// Helper function to categorize tools based on their name and common patterns
function categorizeTool(toolName: string): ToolCategory {
  const name = normalizeName(toolName);

  // Meta frameworks
  if ([
    'next.js', 'nuxt', 'remix', 'sveltekit', 'svelte / kit', 'qwik city',
    'solidstart', 'tanstack start', 'analog', 'fresh'
  ].some(mf => name.includes(normalizeName(mf)))) {
    return categories.find(c => c.id === 'metaframework') || categories[2];
  }

  // Frameworks (Mitosis, Gatsby, Docusaurus, Nitro, UnJS libs, Unplugin, React Router, Astro / Starlight)
  if ([
    'mitosis', 'gatsby', 'docusaurus', 'nitro', 'unjs libs', 'unplugin', 'react router', 'astro / starlight'
  ].some(fw => name.includes(normalizeName(fw)))) {
    return categories.find(c => c.id === 'framework') || categories[2];
  }

  // Compilers (including React Compiler)
  if ([
    'swc', 'babel', 'tsc', 'react compiler', 'ts-node'
  ].some(comp => name.includes(normalizeName(comp)))) {
    return categories.find(c => c.id === 'compiler') || categories[2];
  }

  // Libraries (React, Preact, Angular, Vue.js, Svelte, Solid.js, LIT, Alpine, etc.)
  if ([
    'react', 'preact', 'angular', 'vue.js', 'svelte', 'solid.js', 'lit', 'alpine'
  ].some(lib => name.includes(normalizeName(lib)))) {
    return categories.find(c => c.id === 'library') || categories[2];
  }

  // Bundlers
  if ([
    'vite', 'webpack', 'parcel', 'rollup', 'rolldown', 'turbopack', 'rspack', 'farm', 'esbuild'
  ].map(normalizeName).includes(name)) {
    return categories.find(c => c.id === 'bundler') || categories[2];
  }

  // Runtimes
  if ([
    'deno', 'bun', 'node.js'
  ].map(normalizeName).includes(name)) {
    return categories.find(c => c.id === 'runtime') || categories[2];
  }

  // Parsers
  if ([
    'acorn', 'oxc'
  ].map(normalizeName).includes(name)) {
    return categories.find(c => c.id === 'parser') || categories[2];
  }

  // Linters
  if ([
    'eslint', 'oxlint', 'biome'
  ].map(normalizeName).includes(name)) {
    return categories.find(c => c.id === 'linter') || categories[2];
  }

  // Formatters
  if ([
    'prettier'
  ].map(normalizeName).includes(name)) {
    return categories.find(c => c.id === 'formatter') || categories[2];
  }

  // Minimizers
  if ([
    'terser'
  ].map(normalizeName).includes(name)) {
    return categories.find(c => c.id === 'minimizer') || categories[2];
  }

  // Testing
  if ([
    'vitest'
  ].map(normalizeName).includes(name)) {
    return categories.find(c => c.id === 'testing') || categories[2];
  }

  // Language tools
  if ([
    'volar.js'
  ].map(normalizeName).includes(name)) {
    return categories.find(c => c.id === 'language-tool') || categories[2];
  }

  // Default to library
  return categories.find(c => c.id === 'library') || categories[2];
}

// Raw tool data from the user
const rawTools = [
  'TanStack Start', 'SolidStart', 'Solid.js', 'LIT', 'Alpine', 'Qwik', 'Qwik City',
  'Analog', 'Angular', 'Nuxt', 'Vue.js', 'Astro / Starlight', 'Svelte', 'SvelteKit',
  'Preact', 'Remix', 'React Router', 'React', 'Next.js', 'Docusaurus',
  'Gatsby', 'Fresh', 'Mitosis', 'Volar.js', 'Nitro', 'UnJS libs',
  'Vitest', 'Vite', 'Parcel', 'Turbopack', 'Webpack',
  'Rspack', 'Farm', 'Deno', 'Bun', 'esbuild', 'Rollup', 'Rolldown',
  'Unplugin', 'Biome', 'Prettier', 'React Compiler', 'ESLint', 'ts-node',
  'Terser', 'Babel', 'Acorn', 'tsc', 'SWC', 'OXC', 'Oxlint'
];

// Raw edge data from the user
const rawEdges = [
  { source: 'SolidStart', target: 'Solid.js', label: 'Based on' },
  { source: 'Analog', target: 'Angular', label: 'Based on' },
  { source: 'Nuxt', target: 'Vue.js', label: 'Based on' },
  { source: 'Remix', target: 'React Router', label: 'V2 Turned into' },
  { source: 'React Router', target: 'React', label: 'based on' },
  { source: 'Remix', target: 'React', label: 'until v3 based on' },
  { source: 'React', target: 'Preact', label: 'V3 started based on' },
  { source: 'Next.js', target: 'React', label: 'Based on' },
  { source: 'Docusaurus', target: 'React', label: 'Based on' },
  { source: 'Gatsby', target: 'React', label: 'Based on' },
  { source: 'Fresh', target: 'Preact', label: 'Based on' },
  { source: 'Mitosis', target: 'Solid.js', label: 'Compiles to' },
  { source: 'Mitosis', target: 'Qwik', label: 'Compiles to' },
  { source: 'Mitosis', target: 'Angular', label: 'Compiles to' },
  { source: 'Mitosis', target: 'Vue.js', label: 'Compiles to' },
  { source: 'Mitosis', target: 'Svelte', label: 'Compiles to' },
  { source: 'Mitosis', target: 'React', label: 'Compiles to' },
  { source: 'Volar.js', target: 'Vue.js', label: 'Language tools' },
  { source: 'Volar.js', target: 'Astro / Starlight', label: 'Language tools' },
  { source: 'Astro / Starlight', target: 'Solid.js', label: 'Astro supports components of' },
  { source: 'Astro / Starlight', target: 'Qwik', label: 'With @qwikdev/astro' },
  { source: 'Astro / Starlight', target: 'Angular', label: 'With @analogjs/astro-angular' },
  { source: 'Astro / Starlight', target: 'Vue.js', label: 'Astro supports components of' },
  { source: 'Astro / Starlight', target: 'Svelte', label: 'Astro supports components of' },
  { source: 'Astro / Starlight', target: 'Preact', label: 'Astro supports components of' },
  { source: 'Astro / Starlight', target: 'React', label: 'Astro supports components of' },
  { source: 'TanStack Start', target: 'Vite', label: 'Bundling with Vite' },
  { source: 'SolidStart', target: 'Vite', label: 'Bundling with Vite' },
  { source: 'LIT', target: 'Vite', label: 'Bundling with Vite' },
  { source: 'Qwik City', target: 'Vite', label: 'Bundling with Vite' },
  { source: 'Analog', target: 'Vite', label: 'Bundling with Vite' },
  { source: 'Nuxt', target: 'Vite', label: 'Bundling with Vite' },
  { source: 'SvelteKit', target: 'Vite', label: 'Bundling with Vite' },
  { source: 'Remix', target: 'Vite', label: 'Official bundling with' },
  { source: 'Remix', target: 'Webpack', label: 'Legacy bundling with' },
  { source: 'Next.js', target: 'Turbopack', label: 'dev from v13.1, build from v15.3 (experimental)' },
  { source: 'Vitest', target: 'Vite', label: 'build' },
  { source: 'Nuxt', target: 'Nitro', label: 'Use' },
  { source: 'Nitro', target: 'UnJS libs', label: 'Use' },
  { source: 'Vite', target: 'esbuild', label: 'Dev build' },
  { source: 'Vite', target: 'Rollup', label: 'Prod build' },
  { source: 'Vite', target: 'Rolldown', label: 'Build (experimental in v5)' },
  { source: 'Vite', target: 'rolldown-vite package', label: 'Use' },
  { source: 'rolldown-vite package', target: 'Rolldown', label: 'Dev & Prod Build' },
  { source: 'Webpack', target: 'Rspack', label: '1:1 replacement' },
  { source: 'Webpack', target: 'SWC', label: 'New loaders' },
  { source: 'Webpack', target: 'Terser', label: 'Common Minifier' },
  { source: 'esbuild', target: 'Rollup', label: 'successor' },
  { source: 'Rollup', target: 'Rolldown', label: 'successor' },
  { source: 'Rollup', target: 'Acorn', label: 'V3 and earlier parser' },
  { source: 'Rollup', target: 'OXC', label: 'V4 parser' },
  { source: 'Rollup', target: 'Terser', label: 'Common Minifier' },
  { source: 'Rolldown', target: 'OXC', label: 'Parser, Resolver, etc' },
  { source: 'Oxlint', target: 'OXC', label: 'Resolver' },
  { source: 'Oxlint', target: 'OXC', label: 'Experimental plugin' },
  { source: 'Biome', target: 'OXC', label: 'New JS/TS Plugin in v3.6' },
  { source: 'Biome', target: 'Prettier', label: 'Parser' },
  { source: 'Biome', target: 'ESLint', label: 'Parser' },
  { source: 'ESLint', target: 'Acorn', label: 'New parser (espree)' },
  { source: 'ESLint', target: 'Babel', label: 'Legacy parser (@babel/eslint-parser)' },
  { source: 'ESLint', target: 'tsc', label: 'TypeScript parser (@typescript-eslint/parser)' },
  { source: 'ESLint', target: 'SWC', label: 'Plugin (wip)' },
  { source: 'Prettier', target: 'Babel', label: 'Plugin' },
  { source: 'Prettier', target: 'Acorn', label: 'Parser' },
  { source: 'React Compiler', target: 'Babel', label: 'Plugin' },
  { source: 'React Compiler', target: 'SWC', label: 'Compiler' },
  { source: 'Unplugin', target: 'esbuild', label: 'Parse config files with' },
  { source: 'Unplugin', target: 'Acorn', label: 'Parse config files with' },
  { source: 'Terser', target: 'Acorn', label: 'parser (acorn/terser)' },
  { source: 'Vite', target: 'Unplugin', label: 'Use' },
  { source: 'Webpack', target: 'Unplugin', label: 'Use' },
  { source: 'Rollup', target: 'Unplugin', label: 'Use' },
  { source: 'esbuild', target: 'Unplugin', label: 'Use' },
  { source: 'Rspack', target: 'Unplugin', label: 'Use' },
  { source: 'Astro / Starlight', target: 'Acorn', label: 'Also used directly' },
  { source: 'SvelteKit', target: 'Acorn', label: 'Also used directly' },
  { source: 'Nuxt', target: 'Acorn', label: 'Also used directly' },
  { source: 'UnJS libs', target: 'Acorn', label: 'Also used directly' },
  { source: 'Fresh', target: 'Deno', label: 'Type checker' },
  { source: 'Deno', target: 'SWC', label: 'Type checker' },
  { source: 'ts-node', target: 'tsc', label: '' },
  { source: 'ts-node', target: 'SWC', label: '' },
  { source: 'ts-node', target: 'Bun', label: '' },
  { source: 'Turbopack', target: 'SWC', label: '' },
  { source: 'Rspack', target: 'SWC', label: '' },
  { source: 'Farm', target: 'SWC', label: '' },
  { source: 'Bun', target: 'SWC', label: '' },
  { source: 'esbuild', target: 'SWC', label: '' },
  { source: 'Parcel', target: 'SWC', label: '' },
  // SvelteKit uses Svelte
  { source: 'SvelteKit', target: 'Svelte', label: 'Uses' },
  // Qwik City uses Qwik
  { source: 'Qwik City', target: 'Qwik', label: 'Uses' },
];

// Transform raw data to typed structures
export const tools: Tool[] = rawTools.map((toolName) => {
  const category = categorizeTool(toolName);
  return {
    id: toolName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: toolName,
    category,
    level: category.level,
    logo: `/logos/${toolName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`
  };
});

export const edges: Edge[] = rawEdges.filter(e => e.source !== 'rolldown-vite package' && e.target !== 'rolldown-vite package').map((edge, index) => ({
  id: `edge-${index}`,
  source: edge.source.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  target: edge.target.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  label: edge.label
}));

export const graphData: GraphData = {
  tools,
  edges,
  categories
};
