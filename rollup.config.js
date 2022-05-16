import bundleSize from 'rollup-plugin-bundle-size';
import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs'

export default [
  {
    input: 'src/index.js',
    plugins: [ 
      bundleSize(),
      nodeResolve(),
      commonJS({
        include: 'node_modules/**'
      })
    ],
    output: [
      {
        file: 'dist/automatic-interaction.mjs',
        format: 'es'
      },
      {
        file: 'dist/automatic-interaction.min.js',
        format: 'umd',
        sourcemap: true,
        plugins: [ 
          terser({ ecma: 2018 }),
        ],
        name: 'AutomaticInteraction'
      }
    ]
  }
];
