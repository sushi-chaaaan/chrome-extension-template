"use strict"
const ExtensionReloader = require("webpack-extension-reloader")
const { merge } = require("webpack-merge")
const ZipWebpackPlugin = require("zip-webpack-plugin")

const PATHS = require("./paths")
const common = require("./webpack.common.js")

// Merge webpack configuration files

const config = (_, options) => {
  let config = merge(common, {
    entry: {
      popup: PATHS.src + "/popup.ts",
      contentScript: PATHS.src + "/contentScript.ts",
      background: PATHS.src + "/background.ts",
    },
  })

  if (options.mode === "production") {
    config.plugins.push(
      new ZipWebpackPlugin({
        path: "zip",
        filename: "build.zip",
      })
    )
  }
  if (options.mode === "development") {
    config.plugins.push(new ExtensionReloader())
  }

  return config
}

module.exports = config
