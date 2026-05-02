#!/usr/bin/env node
/**
 * Q2 LOCK — kebab-case 강제. PascalCase 파일 *생성* 차단.
 * src/ 하위 .ts/.tsx/.css 파일명이 kebab-case 또는 [param] dynamic route 형식인지 검증.
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src';
// rev.1 CX1-06 fix: dot-role suffix (.widget, .component, .hook) 허용 추가
const ALLOWED =
  /^([a-z0-9]+(-[a-z0-9]+)*|\[[^\]]+\])(\.(test|stories|d|spec|widget|component|hook|context|api|schema))?\.(ts|tsx|css)$/;
const SKIP_DIRS = new Set(['node_modules', '.next', 'coverage']);

let violations = 0;
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (/\.(ts|tsx|css)$/.test(entry)) {
      // Allowed 예외: app/ 라우팅 특수 파일 (page, layout, loading, error, not-found, route, default, template)
      if (
        /^(page|layout|loading|error|not-found|route|default|template|globals|middleware|next-env\.d|sitemap|robots|manifest)\.(ts|tsx|css)$/.test(
          entry
        )
      )
        continue;
      if (!ALLOWED.test(entry)) {
        console.error(`FAIL [check-file-names] non-kebab filename: ${full}`);
        violations++;
      }
    }
  }
}
walk(ROOT);
if (violations > 0) {
  console.error(
    `\n${violations} violation(s). Filenames must be kebab-case (or [param]) per ADR-006.`
  );
  process.exit(1);
}
console.log('PASS [check-file-names] all filenames kebab-case');
