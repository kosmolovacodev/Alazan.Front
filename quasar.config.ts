// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers';

export default defineConfig((/* ctx */) => {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['pinia'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v7',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      sourcemap: true,
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },

      typescript: {
        strict: true,
        vueShim: true,
        // extendTsConfig (tsConfig) {}
      },

      vueRouterMode: 'hash', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},

      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            vueTsc: true,
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
    devServer: {
      port: 9200,
      open: true,
      // 1. Ponemos el host exacto en un array (como pidió el error de TS)
      allowedHosts: ['semiabsorbent-biserially-bobbye.ngrok-free.dev', '.ngrok-free.dev'],
      // 2. Esta línea es clave para que Vite no se ponga estricto con el túnel
      historyApiFallback: true,

      proxy: {
        '/api': {
          target: 'http://localhost:5183',
          changeOrigin: true,
          secure: false,
        },
        // Proxy para MBA3 — evita CORS en desarrollo
        // El navegador llama a /mba3/... y Vite lo reenvía a 201.148.25.52:8443/...
        '/mba3': {
          target: 'http://201.148.25.52:8443',
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/mba3/, ''),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          configure: (proxy: any) => {
            // Fix: http-proxy no reenvía el header Authorization automáticamente
            // en requests POST con form-encoded. Lo re-inyectamos explícitamente.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            proxy.on('proxyReq', (proxyReq: any, req: any) => {
              const auth = req.headers['authorization'];
              if (auth) {
                proxyReq.setHeader('Authorization', auth);
              }
            });
            // Eliminar WWW-Authenticate para que el navegador no muestre
            // su diálogo nativo de credenciales cuando MBA3 devuelve 401.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            proxy.on('proxyRes', (proxyRes: any) => {
              delete proxyRes.headers['www-authenticate'];
            });
          },
        },
      },
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      plugins: ['Notify', 'Loading', 'Dialog'],
      config: {
        notify: {
          position: 'top-right',
          timeout: 2500,
        },
        loading: { spinnerColor: 'orange-8' },
      },
    },
    animations: [],
    ssr: {
      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render', // keep this as last one
      ],

      pwa: false,
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW', // Modo automático - genera el Service Worker automáticamente
      injectPwaMetaTags: true,
      swHashtag: true,
      extendRouteAlias: true,
      manifest: {
        name: 'Sistema Alazán - Producción',
        short_name: 'Alazán PWA',
        description: 'Módulo de producción standalone',
        display: 'standalone', // Esto quita la barra de navegación del navegador para que parezca app nativa
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          // ... asegúrate de tener los iconos en public/icons
        ],
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf) {},
      // extendElectronPreloadConf (esbuildConf) {},

      // extendPackageJson (json) {},

      // Electron preload scripts (if any) from /src-electron, WITHOUT file extension
      preloadScripts: ['electron-preload'],

      // specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'alazan-frontend',
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      // extendBexScriptsConf (esbuildConf) {},
      // extendBexManifestJson (json) {},

      /**
       * The list of extra scripts (js/ts) not in your bex manifest that you want to
       * compile and use in your browser extension. Maybe dynamic use them?
       *
       * Each entry in the list should be a relative filename to /src-bex/
       *
       * @example [ 'my-script.ts', 'sub-folder/my-other-script.js' ]
       */
      extraScripts: [],
    },
  };
});
