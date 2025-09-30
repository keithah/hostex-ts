/**
 * Example: Guest messaging with hostex-ts
 */

import 'dotenv/config';
import { HostexClient } from '../dist/index.js';

const client = new HostexClient({
  accessToken: process.env.HOSTEX_ACCESS_TOKEN,
});

async function manageConversations() {
  try {
    // List all conversations
    console.log('Fetching conversations...');
    const conversations = await client.listConversations({ offset: 0, limit: 20 });

    if (!conversations.data?.conversations.length) {
      console.log('No conversations found');
      return;
    }

    console.log(`\nFound ${conversations.data.total} conversations`);

    // Display conversations with unread messages
    const unreadConversations = conversations.data.conversations.filter(
      (conv) => (conv.unread_count || 0) > 0
    );

    if (unreadConversations.length > 0) {
      console.log(`\n${unreadConversations.length} conversations with unread messages:`);
      for (const conv of unreadConversations) {
        console.log(`\n  ID: ${conv.id}`);
        console.log(`  Guest: ${conv.guest.name || 'N/A'}`);
        console.log(`  Property: ${conv.property_title || 'N/A'}`);
        console.log(`  Channel: ${conv.channel_type}`);
        console.log(`  Unread: ${conv.unread_count}`);
        console.log(`  Last message: ${conv.last_message_at}`);
      }
    } else {
      console.log('\nNo unread messages');
    }

    // Show all conversations
    console.log('\n\nAll conversations:');
    for (const conv of conversations.data.conversations.slice(0, 10)) {
      console.log(`\n  ID: ${conv.id}`);
      console.log(`  Guest: ${conv.guest.name || conv.guest.email || 'N/A'}`);
      console.log(`  Property: ${conv.property_title || 'N/A'}`);
      console.log(`  Channel: ${conv.channel_type}`);
      if (conv.check_in_date) {
        console.log(`  Dates: ${conv.check_in_date} to ${conv.check_out_date}`);
      }
    }

    // Get details for the first conversation
    if (conversations.data.conversations.length > 0) {
      const firstConv = conversations.data.conversations[0];
      console.log(`\n\nFetching details for conversation ${firstConv.id}...`);

      const details = await client.getConversation(firstConv.id);

      if (details.data?.messages) {
        console.log(`\nConversation with ${details.data.guest.name || 'Guest'}`);
        console.log(`Channel: ${details.data.channel_type}`);
        console.log(`\nRecent messages (${details.data.messages.length} total):`);

        // Show last 5 messages
        const recentMessages = details.data.messages.slice(-5);
        for (const msg of recentMessages) {
          const sender = msg.sender_role === 'host' ? 'You' : 'Guest';
          const preview =
            msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content;
          console.log(`\n  [${msg.created_at}] ${sender}:`);
          console.log(`  ${preview}`);
        }
      }

      // Example: Send a message (commented out)
      console.log('\n\n--- Sending Messages ---');
      console.log('(To send a message, uncomment the code in the example)');
      /*
      console.log('\nSending a message...');
      await client.sendMessage(firstConv.id, {
        message: 'Thank you for your message. We will get back to you shortly!',
      });
      console.log('Message sent successfully');
      */
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

manageConversations();