#!/usr/bin/env node
/**
 * deploy.js — replaces the gh-pages package for Windows compatibility.
 * gh-pages passes every file as a CLI argument to `git rm`, which overflows
 * Windows' 32 KB command-line limit (ENAMETOOLONG). This script uses
 * `git add -A` and `git rm -rf .` which never enumerate file names as args.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

function run(cmd, cwd = DIST) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

if (!fs.existsSync(DIST)) {
  console.error('\n❌  dist/ folder not found. Run `npm run build` first.\n');
  process.exit(1);
}

// Read remote URL from the project root repo
const remoteUrl = execSync('git remote get-url origin', { cwd: ROOT })
  .toString()
  .trim();

console.log('\n🚀  Deploying to gh-pages...\n');

// Work entirely inside dist/
run('git init');
run('git checkout -b gh-pages');
run('git add -A');               // no file list — no ENAMETOOLONG
run('git commit -m "deploy"');
run(`git push --force "${remoteUrl}" gh-pages`);

// Clean up the temporary .git folder inside dist/
fs.rmSync(path.join(DIST, '.git'), { recursive: true, force: true });

console.log('\n✅  Deployed successfully!\n');
