/**
 * Basic usage examples for hostex-ts
 */

import 'dotenv/config';
import { HostexClient, ValidationError, RateLimitError } from '../dist/index.js';

// Initialize the client
const client = new HostexClient({
  accessToken: process.env.HOSTEX_ACCESS_TOKEN,
});

async function main() {
  try {
    // List properties
    console.log('Fetching properties...');
    const properties = await client.listProperties({ limit: 10 });
    console.log(`Found ${properties.data?.total} properties`);

    if (properties.data?.properties) {
      for (const property of properties.data.properties) {
        console.log(`- ${property.title} (ID: ${property.id})`);
        if (property.channels && property.channels.length > 0) {
          console.log(`  Channels: ${property.channels.map(ch => ch.channel_type).join(', ')}`);
        }
      }
    }

    // List reservations for the next month
    console.log('\nFetching reservations...');
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const reservations = await client.listReservations({
      start_check_in_date: today,
      end_check_in_date: nextMonth,
      status: 'accepted',
      limit: 20,
    });

    console.log(`Found ${reservations.data?.total || 0} reservations`);
    if (reservations.data?.reservations) {
      for (const res of reservations.data.reservations.slice(0, 5)) {
        console.log(`- ${res.guest_name || 'N/A'} checking in ${res.check_in_date}`);
        console.log(`  Property: ${res.property_id}, Status: ${res.status}`);
      }
    }

    // Check availability
    if (properties.data?.properties && properties.data.properties.length > 0) {
      const propertyId = properties.data.properties[0].id;
      console.log(`\nChecking availability for property ${propertyId}...`);

      const availability = await client.listAvailabilities({
        property_ids: String(propertyId),
        start_date: today,
        end_date: nextMonth,
      });

      console.log('Availability data retrieved successfully');
      if (availability.data?.listings && availability.data.listings.length > 0) {
        const listing = availability.data.listings[0];
        if (listing.availabilities) {
          const availableDays = listing.availabilities.filter(day => day.available).length;
          console.log(`  ${availableDays} days available out of ${listing.availabilities.length}`);
        }
      }
    }

  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation error:', error.message);
    } else if (error instanceof RateLimitError) {
      console.error('Rate limit exceeded:', error.message);
      if (error.retry_after) {
        console.error(`Retry after ${error.retry_after} seconds`);
      }
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

main();