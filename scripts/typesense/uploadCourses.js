#!/usr/bin/env node

/**
 * uploadCourses.js
 *
 * This script manages the TypeSense database setup and data import for course information.
 * It performs the following main tasks:
 * 1. Validates and loads environment configuration
 * 2. Checks TypeSense server health
 * 3. Sets up the courses collection with proper schema
 * 4. Imports course data from a JSONL file
 *
 * Environment variables used:
 *  - NODE_ENV (set to 'production' or anything else for dev)
 *  - TYPESENSE_API_KEY - API key for TypeSense
 *  - TYPESENSE_PORT - Port number for TypeSense server
 *  - TYPESENSE_HOST - Host address for TypeSense
 */

// Import required dependencies
const path = require('path');
// const envFile =
//   process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
// require('dotenv').config({ path: path.resolve(__dirname, '../../' + envFile) });
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

  // Step 2: Delete existing collection if it exists
  try {
    await client.collections('courses').delete();
    console.log('✅ Existing "courses" collection deleted successfully.');
  } catch (error) {
    if (error.httpStatus === 404) {
      console.log('ℹ️ No existing "courses" collection found.');
    } else {
      console.error('❌ Error deleting collection:', error.message || error);
      process.exit(1);
    }
  }

  // Step 3: Define the collection schema
  const collectionSchema = {
    name: 'courses',
    fields: [
      { name: 'id', type: 'string' }, // Unique identifier for the course
      { name: 'name', type: 'string' }, // Course name/title
      { name: 'credits', type: 'int32', facet: true }, // Number of credits
      { name: 'cores', type: 'string[]', facet: true }, // Core requirements satisfied
      { name: 'grade', type: 'string', facet: true, optional: true }, // Grade requirement (can be null)
    ],
  };

  // Step 4: Create the collection with defined schema
  try {
    await client.collections().create(collectionSchema);
    console.log('✅ Collection "courses" created successfully.');
  } catch (error) {
    if (error && error.message && error.message.includes('already exists')) {
      console.log('ℹ️ Collection "courses" already exists. Skipping creation.');
    } else {
      console.error('❌ Error creating collection:', error.message || error);
      process.exit(1);
    }
  }

  // Step 5: Import course data from JSONL file
  const filePath = path.join(__dirname, 'courses.jsonl');
  if (!fs.existsSync(filePath)) {
    console.error(
      `❌ File not found: ${filePath}. Did you run "node generateCourses.js"?`
    );
    process.exit(1);
  }

  // Step 6: Read and import the data
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const results = await client
      .collections('courses')
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
