/**
 * Example: Managing reservations with hostex-ts
 */

import { HostexClient } from 'hostex-ts';

const client = new HostexClient({
  accessToken: process.env.HOSTEX_ACCESS_TOKEN!,
});

async function manageReservations() {
  try {
    // Get custom channels and income methods first (needed for creating reservations)
    console.log('Fetching custom channels and income methods...');
    const customChannels = await client.listCustomChannels();
    const incomeMethods = await client.listIncomeMethods();

    if (!customChannels.data?.custom_channels.length) {
      console.error('No custom channels found. Please set up a custom channel in Hostex first.');
      return;
    }

    if (!incomeMethods.data?.income_methods.length) {
      console.error('No income methods found. Please set up an income method in Hostex first.');
      return;
    }

    console.log('Available custom channels:');
    customChannels.data.custom_channels.forEach((ch) => {
      console.log(`  - ${ch.name} (ID: ${ch.id})`);
    });

    console.log('\nAvailable income methods:');
    incomeMethods.data.income_methods.forEach((im) => {
      console.log(`  - ${im.name} (ID: ${im.id})`);
    });

    // Create a direct booking (uncomment to actually create)
    /*
    console.log('\nCreating a test reservation...');
    const reservation = await client.createReservation({
      property_id: 'YOUR_PROPERTY_ID',
      custom_channel_id: customChannels.data.custom_channels[0].id,
      check_in_date: '2024-08-01',
      check_out_date: '2024-08-07',
      guest_name: 'Test Guest',
      email: 'test@example.com',
      currency: 'USD',
      rate_amount: 84000, // $840.00 (in cents)
      commission_amount: 8400,
      received_amount: 75600,
      income_method_id: incomeMethods.data.income_methods[0].id,
      number_of_guests: 2,
      remarks: 'Test booking via API',
    });

    console.log('Reservation created:');
    console.log(`  Code: ${reservation.data?.reservation.reservation_code}`);
    console.log(`  Stay Code: ${reservation.data?.reservation.stay_code}`);
    */

    // List recent reservations
    console.log('\nFetching recent reservations...');
    const recentReservations = await client.listReservations({
      limit: 10,
      order_by: 'booked_at',
    });

    if (recentReservations.data?.reservations) {
      console.log(`\nFound ${recentReservations.data.total} total reservations`);
      console.log('Most recent reservations:');

      for (const res of recentReservations.data.reservations) {
        console.log(`\n  Code: ${res.reservation_code}`);
        console.log(`  Guest: ${res.guest_name || 'N/A'}`);
        console.log(`  Property: ${res.property_id}`);
        console.log(`  Status: ${res.status}`);
        console.log(`  Check-in: ${res.check_in_date}`);
        console.log(`  Check-out: ${res.check_out_date}`);
        console.log(`  Channel: ${res.channel_type}`);
      }

      // Update custom fields for the first reservation
      if (recentReservations.data.reservations.length > 0) {
        const firstRes = recentReservations.data.reservations[0];
        console.log(`\n\nManaging custom fields for ${firstRes.stay_code}...`);

        // Get current custom fields
        const fields = await client.getCustomFields(firstRes.stay_code);
        console.log('Current custom fields:', fields.data?.custom_fields);

        // Update custom fields (uncomment to actually update)
        /*
        await client.updateCustomFields(firstRes.stay_code, {
          lock_code: '1234',
          wifi_password: 'GuestWiFi2024',
          parking_spot: 'A-15',
        });
        console.log('Custom fields updated successfully');
        */
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

manageReservations();