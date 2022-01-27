import bundleSize from 'rollup-plugin-bundle-size';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.js',
    plugins: [ bundleSize() ],
    output: [
      {
        file: 'dist/automatic-interaction.mjs',
        format: 'es'
      },
      {
        file: 'dist/automatic-interaction.min.js',
        format: 'umd',
        sourcemap: true,
        plugins: [ terser({ ecma: 2018 }) ],
        name: 'AutomaticInteraction'
      }
    ]
  }
];
