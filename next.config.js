/** @type {import('next').NextConfig} */
const { version } = require('./package.json');
const nextConfig = {
  env: {
    version,
  },
};

module.exports = nextConfig;
