const path = require('path');
const { determineEnv } = require('./modules/envDeterminer');

const Typesense = require('typesense');

determineEnv();

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
  const keys = await client.keys().retrieve();

  console.log('Current keys:');
  console.log(keys);
})();
