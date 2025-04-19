import nextra from 'nextra';

// Define version directly instead of importing from package.json
const version = '0.1.0';

const withNextra = nextra({
  contentDirBasePath: '/docs',
});

const nextConfig = {
  env: {
    version,
  },
};

export default withNextra(nextConfig);

// import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
// initOpenNextCloudflareForDev();
