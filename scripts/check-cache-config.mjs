#!/usr/bin/env node
/**
 * Q9 LOCK Critical 1 — cacheComponents:true + force-dynamic 동시 존재 차단.
 * 사유: Next 16 cacheComponents 활성 시 force-dynamic 무효 → cross-user data leak 위험.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let violations = 0;

// rev.1 R1-03 fix: next.config.{ts,js,mjs} 모두 검색
const NEXT_CONFIG_CANDIDATES = [
  'next.config.ts',
  'next.config.js',
  'next.config.mjs',
];
let cacheComponentsEnabled = false;
for (const cfg of NEXT_CONFIG_CANDIDATES) {
  try {
    const content = readFileSync(cfg, 'utf8');
    if (/cacheComponents\s*:\s*true/.test(content)) {
      cacheComponentsEnabled = true;
      break;
    }
  } catch {
    // 다음 후보 파일 시도
  }
}

// 2. src/ 하위 .ts/.tsx에서 'force-dynamic' export 검사
const FILES = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry)) FILES.push(full);
  }
}
walk('src');

const forceDynamicFiles = FILES.filter((f) => {
  const content = readFileSync(f, 'utf8');
  return /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/.test(content);
});

if (cacheComponentsEnabled && forceDynamicFiles.length > 0) {
  console.error(
    'FAIL [check-cache-config] cacheComponents:true + force-dynamic 동시 존재'
  );
  console.error('  cross-user data leak 위험 (Q9 Critical 1)');
  console.error('  cacheComponents 비활성화 또는 force-dynamic 제거 후 재실행');
  for (const f of forceDynamicFiles) console.error(`    force-dynamic: ${f}`);
  violations++;
}

if (violations > 0) process.exit(1);
console.log(
  'PASS [check-cache-config] cacheComponents 비활성 또는 force-dynamic 미사용'
);
