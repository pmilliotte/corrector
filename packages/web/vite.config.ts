import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    define: Object.entries(env).reduce(
      (prev, [key, val]) => ({
        ...prev,
        ['process.env.' + key]: `"${val}"`,
      }),
      {},
    ),
    build: {
      sourcemap: true,
    },
    plugins: [react(), tsconfigPaths()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  };
});
