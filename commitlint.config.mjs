/** @type {import('@commitlint/types').UserConfig} */
//
// TruthScope FE uses a Gitmoji + Conventional Commits hybrid (per team rule
// in CLAUDE.md). The header pattern allows an optional leading emoji
// prefix, then enforces conventional `type(scope): subject` form.
//
// Example commits that MUST pass:
//   ✨feat(features): attach-to-session A4 reframe
//   🔧chore(test): Vitest CI hardening
//   ♻️refactor: rename CheckMate → TruthScope
//
export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern:
        /^(?:[\p{Emoji_Presentation}\p{Extended_Pictographic}]+)?(\w+)(?:\(([^)]+)\))?: (.+)$/u,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'chore',
        'refactor',
        'test',
        'ci',
        'style',
        'perf',
        'build',
        'revert',
      ],
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'header-max-length': [2, 'always', 120],
  },
};
