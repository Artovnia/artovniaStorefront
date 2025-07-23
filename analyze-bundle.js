// Bundle analyzer configuration for identifying large dependencies
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : '../analyze/client.html',
          openAnalyzer: false,
        })
      );
    }
    return config;
  },
};
