import pkg from './package.json' with { type: 'json' }
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import prettier from 'rollup-plugin-prettier'
import dts from 'rollup-plugin-dts'

const jsConfig = {
  input: 'src/index.mjs',
  output: [
    { file: 'dist/index.umd.js', format: 'umd', name: 'StorageManager', exports: 'named' },
    { file: 'dist/index.mjs', format: 'es' },
    { file: 'dist/index.cjs', format: 'cjs', exports: 'named' },
  ],
  plugins: [
    resolve(),
    commonjs(),
    prettier({
      parser: 'babel',
      printWidth: 120,
      tabWidth: 2,
      useTabs: false,
      singleQuote: true,
      semi: false,
      trailingComma: 'es5',
      arrowParens: 'always',
      htmlWhitespaceSensitivity: 'css',
      singleAttributePerLine: false,
      bracketSameLine: true,
      endOfLine: 'lf',
    }),
    replace({
      preventAssignment: true,
      __VERSION__: JSON.stringify(pkg.version),
    }),
  ],
}

const dtsConfig = {
  input: 'src/index.d.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [dts()],
}

export default [jsConfig, dtsConfig]
