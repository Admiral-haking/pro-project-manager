import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    main: 'src/electron/main/index.ts',
    preload: 'src/electron/preload/index.ts',
  },
  format: ['cjs'],
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'node18',
  minify: false,
  dts: false,
  platform: 'node',
  external: ['electron', 'ssh2'],
  outExtension: () => ({ js: '.cjs' }),
});
