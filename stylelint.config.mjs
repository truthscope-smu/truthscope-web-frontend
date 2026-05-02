/** @type {import('stylelint').Config} */
const config = {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["**/tokens.css", "**/globals.css"],
  plugins: ["stylelint-declaration-strict-value"],
  rules: {
    // 색상 관련 속성은 반드시 CSS Custom Properties(var(--*)) 사용
    "scale-unlimited/declaration-strict-value": [
      ["/color$/", "fill", "stroke", "/margin/", "/padding/", "gap"],
      {
        ignoreValues: ["transparent", "inherit", "currentColor", "0", "auto", "none", "initial"],
      },
    ],
    // Tailwind @theme, @utility 등 커스텀 at-rule 허용
    "at-rule-no-unknown": [true, {
      ignoreAtRules: ["theme", "utility", "variant", "custom-variant", "apply", "tailwind", "layer"],
    }],
    // CSS Custom Properties 네이밍 패턴 강제 안 함 (Tailwind이 생성)
    "custom-property-pattern": null,
    // import 구문 허용
    "import-notation": null,
  },
};

export default config;
