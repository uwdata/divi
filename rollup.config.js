import bundleSize from 'rollup-plugin-bundle-size';
import terser from '@rollup/plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import svg from 'rollup-plugin-svg';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';

export default [
  {
    input: 'src/index.js',
    plugins: [ 
      bundleSize(),
      nodeResolve({ browser: true }),
      commonJS({
        include: 'node_modules/**'
      }),
      svg(),
      postcss({ extensions: [ '.css' ] }),
      json()
    ],
    output: [
      {
        file: 'dist/divi.mjs',
        format: 'es'
      },
      {
        file: 'dist/divi.min.js',
        format: 'umd',
        sourcemap: true,
        plugins: [ 
          terser({ ecma: 2018 }),
        ],
        name: 'divi'
      }
    ]
  }
];
