// import dependences
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const Typesense = require('typesense');

// Initialize TypeSense client with configuration
const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: Number(process.env.TYPESENSE_PORT),
      protocol: 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 2,
});

// Validate that all required environment variables are present
const requiredEnvVars = [
  'TYPESENSE_API_KEY',
  'TYPESENSE_PORT',
  'TYPESENSE_HOST',
];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(
      `❌ Missing required environment variable: ${envVar} (current env: ${process.env.NODE_ENV || 'development'})`
    );
    process.exit(1);
  }
});

(async function main() {
  // Step 1: Check TypeSense server health
  try {
    const health = await client.health.retrieve();
    if (!health.ok) {
      console.error(
        '❌ TypeSense server responded but health check is not ok:',
        health
      );
      process.exit(1);
    }
    console.log('✅ TypeSense server is running and healthy.');
  } catch (error) {
    console.error(
      '❌ Error: Unable to connect to TypeSense server. Is it running?'
    );
    console.error(error.message || error);
    process.exit(1);
  }

  console.log(client.collections('master').retrieve());

  // Step 3: Define the collection schema
  const collectionSchema = {
    name: 'master',
    enable_nested_fields: true,
    fields: [
      { name: 'subject', type: 'string' },
      { name: 'preReqNotes', type: 'string' },
      { name: 'courseString', type: 'string' },
      { name: 'school.description', type: 'string', facet: true },
      { name: 'credits', type: 'int32', facet: true },
      { name: 'subjectDescription', type: 'string' },
      { name: 'coreCodes.coreCode', type: 'string[]' },
      { name: 'expandedTitle', type: 'string', facet: true },
      { name: 'mainCampus', type: 'string', facet: true },
      { name: 'level', type: 'string' },
      { name: 'synopsisUrl', type: 'string' },
      { name: 'lastOffered', type: 'string', facet: true },
      { name: 'uid', type: 'string' },
    ],
  };

  // Step 4: Create the collection with defined schema
  try {
    await client.collections().create(collectionSchema);
    console.log('✅ Collection "master" created successfully.');
  } catch (error) {
    if (error && error.message && error.message.includes('already exists')) {
      console.log('ℹ️ Collection "master" already exists. Skipping creation.');
    } else {
      console.error('❌ Error creating collection:', error.message || error);
      process.exit(1);
    }
  }

  // Step 5: Import course data from JSONL file
  const filePath = path.join(__dirname, 'masterlist.jsonl');
  if (!fs.existsSync(filePath)) {
    console.error(
      `❌ File not found: ${filePath}. Did you run "python3 courses.py"?`
    );
    process.exit(1);
  }

  // Step 6: Read and import the data
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const results = await client
      .collections('master')
      .documents()
      .import(fileContent, { action: 'upsert' });

    console.log('✅ Import results:');
    console.log(results);
  } catch (error) {
    console.error('❌ Error importing data:', error.message || error);
    process.exit(1);
  }

  console.log('🎉 Done setting up TypeSense with courses data.');
})();
