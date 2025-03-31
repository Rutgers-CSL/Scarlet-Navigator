/** @type {import('next').NextConfig} */

import { version } from './package.json';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    version,
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
