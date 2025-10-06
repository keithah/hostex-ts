import { HostexClient } from '../src/index.js';

/**
 * Example: Posting a guest review
 *
 * This demonstrates how to post a review for a guest after their stay.
 * Note: This uses the actual web app API endpoint discovered from network analysis,
 * as the official API documentation for this endpoint is incomplete.
 *
 * How to get your operator ID:
 * 1. Log into https://hostex.io
 * 2. Open browser DevTools (F12)
 * 3. Go to the Network tab
 * 4. Navigate to any page in Hostex
 * 5. Look at any request - the operator ID appears as:
 *    - Query parameter: opid=YOUR_OPERATOR_ID
 *    - Response header: hostex-operator: YOUR_OPERATOR_ID
 */

async function main() {
  // Initialize client with operator ID for review posting
  const client = new HostexClient({
    accessToken: process.env.HOSTEX_ACCESS_TOKEN!,
    operatorId: process.env.HOSTEX_OPERATOR_ID, // Required for review posting - see instructions above
  });

  try {
    // Post a guest review
    const result = await client.postGuestReview({
      reservation_order_code: '0-HMC4N45K9E-i5l0tdff5h',
      content: 'John was an excellent guest during his stay at our SF Cottage! ' +
               'His communication was great from start to finish - he was organized with his plans ' +
               'and very responsive. John and his group treated the property with respect, ' +
               'and he even left a thoughtful message after checkout. I especially appreciated ' +
               'his flexibility and positive attitude throughout his stay. ' +
               'I\'d happily host John again anytime and highly recommend him to other hosts!',
      category_ratings: {
        recommend: 1, // 1 = would recommend, 0 = would not recommend
        overall_rating: 5, // 1-5 scale
        cleanliness: 5,
        cleanliness_content: '', // Optional additional comments
        respect_of_house_rules: 5,
        respect_house_rules_content: '',
        communication: 5,
        communication_content: '',
      },
    });

    console.log('Review posted successfully!');
    console.log('Request ID:', result.request_id);
  } catch (error) {
    console.error('Error posting review:', error);
  }
}

main();
