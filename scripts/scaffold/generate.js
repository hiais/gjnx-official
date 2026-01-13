import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const type = process.argv[2]; // 'component' or 'page'
const name = process.argv[3]; // 'Button' or 'my-page'

if (!type || !name) {
  console.error('❌ Usage: npm run gen:[type] [name]');
  console.error('   Example: npm run gen:component MyButton');
  console.error('   Example: npm run gen:page my-feature');
  process.exit(1);
}

const ROOT_DIR = path.resolve(__dirname, '../../src');

const TEMPLATES = {
  component: (name) => `---
interface Props {
  class?: string;
}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['${name.toLowerCase()}', className]} {...rest}>
  <slot />
</div>

<style>
  .${name.toLowerCase()} {
    /* Styles for ${name} */
  }
</style>
`,
  page: (name) => `---
import MainLayout from '../../layouts/MainLayout.astro';
---

<MainLayout title="${name}">
  <div class="container">
    <h1>${name}</h1>
  </div>
</MainLayout>

<style>
  h1 {
    color: var(--c-accent-cyan);
  }
</style>
`
};

function generate() {
  if (type === 'component') {
    const dir = path.join(ROOT_DIR, 'components/ui');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${name}.astro`);
    if (fs.existsSync(filePath)) {
      console.error(`❌ Component ${name} already exists at ${filePath}`);
      process.exit(1);
    }

    fs.writeFileSync(filePath, TEMPLATES.component(name));
    console.log(`✅ Component created: src/components/ui/${name}.astro`);

  } else if (type === 'page') {
    const dir = path.join(ROOT_DIR, 'pages');
    const filePath = path.join(dir, `${name}.astro`); // Simplified for now

    if (fs.existsSync(filePath)) {
      console.error(`❌ Page ${name} already exists at ${filePath}`);
      process.exit(1);
    }

    fs.writeFileSync(filePath, TEMPLATES.page(name));
    console.log(`✅ Page created: src/pages/${name}.astro`);
  } else {
    console.error('❌ Unknown type. Use "component" or "page".');
    process.exit(1);
  }
}

generate();
