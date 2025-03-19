import { defineConfig } from 'tsup'
import { version } from './package.json'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  minify: true,
  target: 'esnext',
  outDir: 'dist',
  define: {
    __VERSION__: JSON.stringify(version)
  }
})