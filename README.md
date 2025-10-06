# hostex-ts

[![CI Tests](https://github.com/keithah/hostex-ts/actions/workflows/test.yml/badge.svg)](https://github.com/keithah/hostex-ts/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/hostex-ts.svg)](https://www.npmjs.com/package/hostex-ts)

TypeScript client library for the Hostex API v3.0.0 (Beta). Hostex is a property management platform that provides APIs for managing reservations, properties, availabilities, messaging, reviews, and more.

## Features

- **Complete API Coverage**: All Hostex API v3.0.0 endpoints
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Modern**: Built with ES modules and async/await
- **Zero Dependencies**: Uses native fetch API
- **Easy to Use**: Simple, intuitive interface

### Supported APIs

- 🏠 **Properties** - Property and room type management
- 📅 **Reservations** - CRUD operations, custom fields, lock codes
- 📊 **Availability** - Property availability management
- 📋 **Listings** - Calendar, pricing, inventory, restrictions
- 💬 **Messaging** - Guest communication and messaging
- ⭐ **Reviews** - Review management and responses
- 🔗 **Webhooks** - Real-time event notifications
- ⚙️ **Utilities** - Custom channels and income methods

## Installation

```bash
npm install hostex-ts
```

## Quick Start

```typescript
import { HostexClient } from 'hostex-ts';

// Initialize the client
const client = new HostexClient({
  accessToken: 'your_hostex_api_token'
});

// List properties
const properties = await client.listProperties({ limit: 10 });
console.log(properties.data?.properties);

// List reservations
const reservations = await client.listReservations({
  status: 'accepted',
  start_check_in_date: '2025-01-01',
  end_check_in_date: '2025-12-31'
});
```

## Authentication

Get your API token from your Hostex account settings.

```typescript
const client = new HostexClient({
  accessToken: process.env.HOSTEX_ACCESS_TOKEN!
});
```

## Usage Examples

### Properties

```typescript
// List all properties
const response = await client.listProperties({ limit: 100 });
const properties = response.data?.properties || [];

// Get specific property
const property = await client.listProperties({ id: 12345 });

// List room types
const roomTypes = await client.listRoomTypes();
```

### Reservations

```typescript
// List reservations
const reservations = await client.listReservations({
  start_check_in_date: '2024-07-01',
  end_check_in_date: '2024-07-31',
  status: 'accepted',
  limit: 50
});

// Create a direct booking
const reservation = await client.createReservation({
  property_id: '12345',
  custom_channel_id: 1,
  check_in_date: '2024-07-01',
  check_out_date: '2024-07-07',
  guest_name: 'Jane Smith',
  currency: 'USD',
  rate_amount: 84000, // $840.00 (in cents)
  commission_amount: 8400,
  received_amount: 75600,
  income_method_id: 1
});

// Update lock code
await client.updateLockCode('0-1234567-abcdef', '1234');

// Manage custom fields
const fields = await client.getCustomFields('0-1234567-abcdef');
await client.updateCustomFields('0-1234567-abcdef', {
  lock_code: '1234',
  wifi_password: 'GuestWiFi2024'
});

// Cancel reservation
await client.cancelReservation('0-1234567-abcdef');
```

### Availability

```typescript
// Check availability
const availability = await client.listAvailabilities({
  property_ids: '12345,67890',
  start_date: '2024-07-01',
  end_date: '2024-07-31'
});

// Block dates
await client.updateAvailabilities({
  property_ids: [12345],
  dates: ['2024-07-15', '2024-07-16'],
  available: false
});

// Open dates
await client.updateAvailabilities({
  property_ids: [12345],
  start_date: '2024-08-01',
  end_date: '2024-08-07',
  available: true
});
```

### Conversations

```typescript
// List conversations
const conversations = await client.listConversations({ limit: 50 });

// Get conversation details
const conversation = await client.getConversation('conversation_id');

// Send a message
await client.sendMessage('conversation_id', {
  message: 'Thank you for choosing our property!'
});
```

### Reviews

```typescript
// List reviews
const reviews = await client.listReviews({
  start_check_out_date: '2024-01-01',
  end_check_out_date: '2024-06-30'
});

// Leave a review
await client.createReview('reservation_code', {
  host_review_score: 5.0,
  host_review_content: 'Excellent guest!'
});

// Reply to a review
await client.createReview('reservation_code', {
  host_reply_content: 'Thank you for the wonderful review!'
});

// Post a guest review (requires operatorId in client config)
await client.postGuestReview({
  reservation_order_code: '0-ABC123-xyz',
  content: 'Great guest, would host again!',
  category_ratings: {
    recommend: 1, // 1 = would recommend, 0 = would not
    overall_rating: 5, // 1-5 scale
    cleanliness: 5,
    cleanliness_content: '',
    respect_of_house_rules: 5,
    respect_house_rules_content: '',
    communication: 5,
    communication_content: ''
  }
});
```

### Webhooks

```typescript
// List webhooks
const webhooks = await client.listWebhooks();

// Create webhook
const webhook = await client.createWebhook('https://your-app.com/webhook');

// Delete webhook
await client.deleteWebhook(123);
```

### Listing Management

```typescript
// Get calendar data
const calendar = await client.getListingCalendar({
  start_date: '2024-07-01',
  end_date: '2024-07-31',
  listings: [
    { channel_type: 'airbnb', listing_id: '12345678' }
  ]
});

// Update prices
await client.updateListingPrices({
  channel_type: 'airbnb',
  listing_id: '12345678',
  prices: [
    { date: '2024-07-15', price: 150.00 },
    { date: '2024-07-16', price: 175.00 }
  ]
});

// Update inventory
await client.updateListingInventories({
  channel_type: 'booking.com',
  listing_id: 'hotel_123',
  inventories: [
    { date: '2024-07-15', inventory: 0 },
    { date: '2024-07-16', inventory: 1 }
  ]
});
```

### Utility Endpoints

```typescript
// Get custom channels
const channels = await client.listCustomChannels();

// Get income methods
const incomeMethods = await client.listIncomeMethods();
```

## Error Handling

```typescript
try {
  const reservations = await client.listReservations();
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
  }
}
```

## Configuration

```typescript
const client = new HostexClient({
  accessToken: 'your_token',
  baseUrl: 'https://api.hostex.io/v3', // Optional, uses default
  webAppBaseUrl: 'https://hostex.io/api', // Optional, for web app API endpoints
  operatorId: 'your_operator_id', // Optional, required for review posting
  timeout: 30000 // Optional, request timeout in ms (default: 30000)
});
```

### Finding Your Operator ID

The operator ID is required for posting guest reviews. To find it:

1. Log into [https://hostex.io](https://hostex.io)
2. Open browser DevTools (F12)
3. Go to the Network tab
4. Navigate to any page in Hostex (e.g., Dashboard, Reviews)
5. Click on any API request in the Network tab
6. The operator ID appears as:
   - **Query parameter**: `opid=YOUR_OPERATOR_ID`
   - **Response header**: `hostex-operator: YOUR_OPERATOR_ID`

## API Reference

For detailed API documentation, see the [Hostex API Docs](https://docs.hostex.io/).

## TypeScript Support

This library is written in TypeScript and includes comprehensive type definitions. All API responses are fully typed.

```typescript
import type {
  Property,
  Reservation,
  Conversation
} from 'hostex-ts';
```

## Requirements

- Node.js >= 18 (for native fetch support)
- TypeScript >= 5.0 (if using TypeScript)

## License

MIT

## Support

- **Issues**: [GitHub Issues](https://github.com/keithah/hostex-ts/issues)
- **Hostex API Docs**: https://docs.hostex.io/
- **Hostex Support**: contact@hostex.io

---

**Note**: This library is not officially supported by Hostex. It's a community-driven project.