import bundleSize from 'rollup-plugin-bundle-size';
import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs'

// const external = [ 'd3' ];
// const globals = { 'd3': 'd3' }

export default [
  {
    input: 'src/index.js',
    // external,
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
        format: 'es',
        // globals
      },
      {
        file: 'dist/automatic-interaction.min.js',
        format: 'umd',
        // globals,
        sourcemap: true,
        plugins: [ 
          terser({ ecma: 2018 }),
        ],
        name: 'AutomaticInteraction'
      }
    ]
  }
];
