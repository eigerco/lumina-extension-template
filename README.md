# Lumina Extension Template
Template repository to get you started with developing a browser extension which uses Lumina.

## Building 

1. Until lumina is released to npm, you'll need to install the packages manually
```bash
$ npm i lumina-node-wasm-0.2.0.tgz
$ npm i lumina-node-shim-0.2.0.tgz
```

2. Install other dependencies 
```bash
$ npm install
```

3. Use webpack to build the extension
```bash
$ npx webpack --config webpack.config.js
```

4. You can load unpacked extension for development from the `extension` directory or package it once you're ready
