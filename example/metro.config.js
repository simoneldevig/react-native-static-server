/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const fs = require('fs');
const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');

const modules = Object.keys({
  ...pak.peerDependencies,
});

const rnPath = fs.realpathSync(
  path.resolve(require.resolve('react-native/package.json'), '..'),
);

const rnwPath = fs.realpathSync(
  path.resolve(require.resolve('react-native-windows/package.json'), '..'),
);

module.exports = {
  projectRoot: __dirname,
  watchFolders: [root],

  resolver: {
    blockList: exclusionList([
      // We need to make sure that only one version is loaded for peerDependencies
      // So we block them at the root, and alias them to the versions in example's node_modules
      ...modules.map(
        (m) =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`),
      ),
      // This stops "react-native run-windows" from causing the metro server to crash if its already running
      new RegExp(
        `${path.resolve(__dirname, 'windows').replace(/[/\\]/g, '/')}.*`,
      ),
      // This prevents "react-native run-windows" from hitting: EBUSY: resource busy or locked, open msbuild.ProjectImports.zip or other files produced by msbuild
      new RegExp(`${rnwPath}/build/.*`),
      new RegExp(`${rnwPath}/target/.*`),
      /.*\.ProjectImports\.zip/,
    ]),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),

    resolveRequest: (context, moduleName, platform) => {
      let context2 = context;
      let moduleName2 = moduleName;
      if (platform === 'windows') {
        // The way react-native-windows works, we have to shadow
        // all possible references to react-native by references
        // to the corresponding react-native-windows files.
        if (moduleName2 === 'react-native') moduleName2 = rnwPath;
        if (context2.originModulePath.startsWith(`${rnPath}\\`)) {
          context2 = {
            ...context2,
            originModulePath: context2.originModulePath.replace(rnPath, rnwPath),
          };
        }
      }
      return context.resolveRequest(context2, moduleName2, platform);
    },
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
