const path = require("path");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: {
    popup: "./src/popup.js",
    background: "./src/background.js",
  },
  output: {
    path: path.resolve(__dirname, "extension"),
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
      {
        test: /\.wasm$/,
        type: "asset/resource",
      },
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
