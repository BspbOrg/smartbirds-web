import inject from '@rollup/plugin-inject'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import virtual from '@rollup/plugin-virtual'
import terser from '@rollup/plugin-terser'

export default {
  input: 'client/scripts/sw.js',
  output: {
    file: 'public/sw.js',
    format: 'es'
  },
  plugins: [
    virtual({
      process_env: `export default {env: ${JSON.stringify({
        NODE_ENV: process.env.NODE_ENV
      })}}`
    }),
    inject({
      process: 'process_env'
    }),
    nodeResolve({}),
    terser()
  ]
}
