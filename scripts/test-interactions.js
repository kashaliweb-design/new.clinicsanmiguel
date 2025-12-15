/**
 * Test Script: Verify Interactions Logging
 * Run this to check if interactions are being saved to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testInteractions() {
  console.log('🔍 Testing Interactions Table...\n');

  // Test 1: Check if table exists and is accessible
  console.log('Test 1: Checking table accessibility...');
  const { data: interactions, error: selectError } = await supabase
    .from('interactions')
    .select('*')
    .limit(5);

  if (selectError) {
    console.error('❌ Error reading interactions:', selectError.message);
    return;
  }

  console.log(`✅ Table accessible. Found ${interactions?.length || 0} recent interactions\n`);

  // Test 2: Count total interactions
  console.log('Test 2: Counting total interactions...');
  const { count, error: countError } = await supabase
    .from('interactions')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting:', countError.message);
  } else {
    console.log(`✅ Total interactions in database: ${count}\n`);
  }

  // Test 3: Count by channel
  console.log('Test 3: Counting by channel...');
  const { data: channelCounts, error: channelError } = await supabase
    .from('interactions')
    .select('channel');

  if (!channelError && channelCounts) {
    const counts = channelCounts.reduce((acc, row) => {
      acc[row.channel] = (acc[row.channel] || 0) + 1;
      return acc;
    }, {});
    console.log('Channel breakdown:', counts);
  }
  console.log('');

  // Test 4: Insert a test interaction
  console.log('Test 4: Inserting test interaction...');
  const testSessionId = `test-${Date.now()}`;
  const { data: inserted, error: insertError } = await supabase
    .from('interactions')
    .insert({
      session_id: testSessionId,
      channel: 'web_chat',
      direction: 'inbound',
      message_body: 'Test message from test script',
      from_number: null,
      to_number: null,
      intent: 'test',
      metadata: { test: true, timestamp: new Date().toISOString() },
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ Error inserting test interaction:', insertError.message);
    console.error('Details:', insertError);
  } else {
    console.log('✅ Test interaction inserted successfully!');
    console.log('ID:', inserted.id);
    console.log('Session ID:', inserted.session_id);
    console.log('');

    // Test 5: Read back the test interaction
    console.log('Test 5: Reading back test interaction...');
    const { data: readBack, error: readError } = await supabase
      .from('interactions')
      .select('*')
      .eq('session_id', testSessionId)
      .single();

    if (readError) {
      console.error('❌ Error reading back:', readError.message);
    } else {
      console.log('✅ Test interaction read successfully!');
      console.log('Message:', readBack.message_body);
      console.log('');

      // Clean up: Delete test interaction
      console.log('Test 6: Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('interactions')
        .delete()
        .eq('session_id', testSessionId);

      if (deleteError) {
        console.error('❌ Error deleting test interaction:', deleteError.message);
      } else {
        console.log('✅ Test interaction deleted successfully!\n');
      }
    }
  }

  // Test 7: Show recent web_chat interactions
  console.log('Test 7: Recent web_chat interactions...');
  const { data: recentChat, error: recentError } = await supabase
    .from('interactions')
    .select('session_id, direction, message_body, created_at')
    .eq('channel', 'web_chat')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentError) {
    console.error('❌ Error fetching recent chats:', recentError.message);
  } else if (recentChat && recentChat.length > 0) {
    console.log(`✅ Found ${recentChat.length} recent web_chat interactions:`);
    recentChat.forEach((interaction, index) => {
      console.log(`\n${index + 1}. [${interaction.direction}] ${new Date(interaction.created_at).toLocaleString()}`);
      console.log(`   Message: ${interaction.message_body?.substring(0, 100)}${interaction.message_body?.length > 100 ? '...' : ''}`);
    });
  } else {
    console.log('⚠️  No web_chat interactions found yet. Try using the chatbot first!');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('='.repeat(60));
}

testInteractions().catch(console.error);
