const { resolve } = require('path')
const { BannerPlugin } = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const pkg = require('./package.json')

const banner = `${'-'.repeat(20)}
${pkg.displayName} (${pkg.name})
${pkg.description}

@version ${pkg.version}
@license ${pkg.license}
@author ${pkg.author.name} (${pkg.author.url})
@readme ${pkg.homepage}
@pkg ${pkg.repository}
${'-'.repeat(20)}`

module.exports = (_, argv) => {
  const isDev = (argv.mode && argv.mode === 'development') || false
  const analyze = (argv.env && argv.env.analyze) || false
  console.log('Development:', isDev)

  return {
    target: 'node',
    entry: resolve(__dirname, 'src', 'extension.ts'),
    output: {
      path: resolve(__dirname, 'dist'),
      filename: 'extension.js',
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    externals: {
      // the vscode-module is created on-the-fly and must be excluded.
      // See: https://webpack.js.org/configuration/externals/
      vscode: 'commonjs vscode',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    optimization: {
      namedModules: true,
      namedChunks: true,
      minimize: !isDev,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          cache: true,
        }),
      ],
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [resolve(__dirname, 'dist')],
      }),
      new BannerPlugin(banner),
      new BundleAnalyzerPlugin({
        analyzerMode: analyze ? 'server' : 'disabled',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
            },
          ],
        },
      ],
    },
    stats: {
      performance: true,
      providedExports: true,
      timings: true,
    },
  }
}
