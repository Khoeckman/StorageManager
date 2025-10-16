import pkg from './package.json' with { type: 'json' }
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import prettier from 'rollup-plugin-prettier'

export default {
  input: 'index.js',
  output: {
    file: 'index.umd.js',
    format: 'umd',
    name: 'StorageManager',
  },
  plugins: [
    resolve(),
    commonjs(),
    prettier({
      parser: 'typescript',
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
