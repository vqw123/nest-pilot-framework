import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  // ✅ 기본 ESLint 설정
  eslint.configs.recommended,

  // ✅ TypeScript 지원 추가
  {
    files: ['**/*.ts', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: './tsconfig.json', // ✅ tsconfig.json 사용
        tsconfigRootDir: import.meta.dirname, // ✅ tsconfig 경로 설정
        sourceType: 'module', // ✅ 모듈 시스템 사용
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': {}, // ✅ 불필요한 import 감지
    },
    rules: {
      // ❌ 사용하지 않는 변수에 대한 검사 비활성화 (기본적으로 경고 또는 오류 발생)
      // "no-unused-vars": "off",

      // ❌ TypeScript의 namespace 사용을 제한하지 않음 (모듈 시스템에서는 잘 안 씀)
      // "@typescript-eslint/no-namespace": "off",

      // ❌ `this`를 변수에 저장하는 패턴을 허용 (예: const self = this)
      // "@typescript-eslint/no-this-alias": "off",

      // ❌ 빈 함수 사용을 허용 (일반적으로 의미 없는 함수는 경고 발생)
      // "@typescript-eslint/no-empty-function": "off",

      // ⚠️ 함수의 반환 타입 명시 경고 (반환 타입을 지정하지 않으면 경고)
      '@typescript-eslint/explicit-function-return-type': 'warn',

      // ⚠️ 모듈의 함수 반환 타입 명시 경고 (export된 함수는 반환 타입이 명확해야 함)
      '@typescript-eslint/explicit-module-boundary-types': 'warn',

      // ❌ `null` 체크 없이 `!`(non-null assertion) 사용을 허용 (런타임 에러 위험)
      // "@typescript-eslint/no-non-null-assertion": "off",

      // ✅ `any` 타입 사용을 금지 (any 사용을 강하게 제한)
      '@typescript-eslint/no-explicit-any': 'error',

      // ✅ `await`를 비동기 함수가 아닌 값에서 사용하는 것을 금지
      '@typescript-eslint/await-thenable': 'error',

      // ⚠️ 사용하지 않는 import가 있으면 경고 (컴파일 가능하지만 유지보수 필요)
      'unused-imports/no-unused-imports-ts': 'warn',

      // ✅ 불필요한 타입 import를 방지하고, `import type { SomeType } from 'module'`을 강제
      '@typescript-eslint/consistent-type-imports': 'error',

      // ⚠️ 사용되지 않는 변수 경고 (함수 인자의 경우 _로 시작하면 예외)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // ✅ Prettier 설정 추가 (Prettier와 ESLint 충돌 방지)
  prettier,

  // ✅ 추가된 옵션 (네 설정에서 반영되지 않은 부분)
  {
    root: true, // ✅ 프로젝트의 최상위 ESLint 설정
    ignores: ['.eslintrc.js', 'test/**/*.ts', '**/*.spec.ts'], // ✅ 특정 파일 ESLint 무시
    languageOptions: {
      env: { node: true }, // ✅ Node.js 환경 지원 추가
    },
  },
];
