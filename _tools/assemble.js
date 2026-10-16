/* Assemble the publish folder (_site) from git-tracked WEB files only.

   node _tools/assemble.js

   Run by the Pages workflow before the comment stripper, and locally to test exactly what
   ships. The file list comes from `git ls-files`, so untracked working files (audits,
   source photos, zips) can never reach the site even when run on a messy working copy. */
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = '_site';
const WEB = /\.(html|css|js|png|jpe?g|webp|gif|svg|ico|mp4|webm|xml|txt)$/i;
const DENY = /^(\.github\/|_tools\/|build\.js$)|(^|\/)\./;   // tooling, and any dotfile

const tracked = execSync('git ls-files -z').toString().split('\0').filter(Boolean);
const files = tracked.filter(f => (WEB.test(f) || f === 'CNAME') && !DENY.test(f));
const skipped = tracked.filter(f => !files.includes(f));

fs.rmSync(OUT, { recursive: true, force: true });
for (const f of files) {
  const dest = path.join(OUT, f);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(f, dest);
}

// Hard stop if tooling ever slips through the filters.
for (const bad of ['build.js', '.gitignore', '_tools', '.github']) {
  if (fs.existsSync(path.join(OUT, bad))) { console.error('REFUSING: ' + bad + ' ended up in ' + OUT); process.exit(1); }
}
console.log(`${OUT}: ${files.length} files published, ${skipped.length} withheld (${skipped.join(', ')})`);
