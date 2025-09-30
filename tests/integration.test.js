#!/usr/bin/env node

/**
 * Integration tests for hostex-ts client library
 * These tests run against the live Hostex API
 * Requires HOSTEX_ACCESS_TOKEN environment variable
 */

import { HostexClient } from '../dist/index.js';
import * as dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN = process.env.HOSTEX_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ Error: HOSTEX_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

const client = new HostexClient({ accessToken: ACCESS_TOKEN });

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name, testFn) {
  try {
    process.stdout.write(`Testing: ${name}... `);
    const startTime = Date.now();
    await testFn();
    const duration = Date.now() - startTime;
    console.log(`✓ (${duration}ms)`);
    testsPassed++;
  } catch (error) {
    console.log(`✗`);
    console.error(`  Error: ${error.message}`);
    testsFailed++;
  }
}

console.log('\n🧪 Running Hostex API Integration Tests\n');

await runTest('List properties', async () => {
  const result = await client.listProperties({ limit: 10 });
  if (!result.data) throw new Error('No data returned');
});

await runTest('List room types', async () => {
  const result = await client.listRoomTypes({ limit: 10 });
  if (!result.data) throw new Error('No data returned');
});

await runTest('List reservations', async () => {
  const result = await client.listReservations({
    limit: 5,
    start_check_in_date: '2025-09-01',
    end_check_in_date: '2025-10-31'
  });
  if (!result.data) throw new Error('No data returned');
});

await runTest('List custom channels', async () => {
  const result = await client.listCustomChannels();
  if (!result.data) throw new Error('No data returned');
});

await runTest('List income methods', async () => {
  const result = await client.listIncomeMethods();
  if (!result.data) throw new Error('No data returned');
});

await runTest('List conversations', async () => {
  const result = await client.listConversations({ offset: 0, limit: 5 });
  if (!result.data) throw new Error('No data returned');
});

await runTest('List reviews', async () => {
  const result = await client.listReviews({ limit: 5 });
  if (!result.data) throw new Error('No data returned');
});

await runTest('List webhooks', async () => {
  const result = await client.listWebhooks();
  if (!result.data) throw new Error('No data returned');
});

await runTest('Check availability', async () => {
  // Get first property to test availability
  const properties = await client.listProperties({ limit: 1 });
  if (!properties.data || !properties.data.properties || properties.data.properties.length === 0) {
    throw new Error('No properties available for testing');
  }
  const propertyId = properties.data.properties[0].id;

  const result = await client.listAvailabilities({
    property_ids: propertyId.toString(),
    start_date: '2025-10-01',
    end_date: '2025-10-07'
  });
  if (!result.data) throw new Error('No data returned');
});

console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log('='.repeat(50) + '\n');

if (testsFailed > 0) {
  process.exit(1);
}