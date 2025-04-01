const path = require('path');
const { determineEnv } = require('./modules/envDeterminer');

determineEnv();

const env = process.env.NODE_ENV || 'development';

let dotEnvPath =
  env === 'production' ? '.env.production.local' : '.env.development';

require('dotenv').config({
  path: [path.resolve(process.cwd(), dotEnvPath)],
});

const Typesense = require('typesense');

const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: Number(process.env.TYPESENSE_PORT),
      protocol: 'https',
    },
  ],
  apiKey: process.env.TYPESENSE_API_ADMIN_KEY,
  connectionTimeoutSeconds: 2,
});

(async function main() {
  const key = await client.keys().create({
    description: 'Search-only master key.',
    actions: ['documents:search'],
    collections: ['master'],
  });

  console.log(key);
})();
