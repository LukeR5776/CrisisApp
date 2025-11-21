/**
 * Seed Engagement Data Script
 *
 * Populates the post_engagements table with random like and share counts
 * for demo purposes. Generates realistic engagement data for all families.
 *
 * Usage:
 * EXPO_PUBLIC_SUPABASE_URL="..." \
 * EXPO_PUBLIC_SUPABASE_ANON_KEY="..." \
 * npx ts-node scripts/seedEngagement.ts
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Generate random number within a range
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random UUID (fake user ID for engagement records)
 */
function generateFakeUserId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function seedEngagementData() {
  console.log('🌱 Starting engagement data seeding...\n');

  try {
    // Step 1: Fetch all crisis families
    console.log('📋 Fetching all crisis families...');
    const { data: families, error: fetchError } = await supabase
      .from('crisis_families')
      .select('id, name');

    if (fetchError) {
      throw new Error(`Failed to fetch families: ${fetchError.message}`);
    }

    if (!families || families.length === 0) {
      console.log('⚠️  No families found in database');
      console.log('Please add families first using addFamily.ts script');
      process.exit(0);
    }

    console.log(`✅ Found ${families.length} families\n`);

    // Step 2: Generate engagement records for each family
    console.log('🎲 Generating engagement records...');

    const engagementRecords: Array<{
      user_id: string;
      family_id: string;
      engagement_type: 'like' | 'share';
    }> = [];

    for (const family of families) {
      // Generate random like count (50-500)
      const likesCount = randomInRange(50, 500);

      // Generate random shares count (10-100)
      const sharesCount = randomInRange(10, 100);

      console.log(`  ${family.name}: ${likesCount} likes, ${sharesCount} shares`);

      // Create fake like records
      for (let i = 0; i < likesCount; i++) {
        engagementRecords.push({
          user_id: generateFakeUserId(),
          family_id: family.id,
          engagement_type: 'like',
        });
      }

      // Create fake share records
      for (let i = 0; i < sharesCount; i++) {
        engagementRecords.push({
          user_id: generateFakeUserId(),
          family_id: family.id,
          engagement_type: 'share',
        });
      }
    }

    console.log(`\n📊 Total engagement records to insert: ${engagementRecords.length}`);

    // Step 3: Insert engagement records in batches (Supabase has limits)
    console.log('\n💾 Inserting engagement records into database...');
    const BATCH_SIZE = 1000;
    let insertedCount = 0;

    for (let i = 0; i < engagementRecords.length; i += BATCH_SIZE) {
      const batch = engagementRecords.slice(i, i + BATCH_SIZE);

      const { error: insertError } = await supabase
        .from('post_engagements')
        .insert(batch);

      if (insertError) {
        console.error(`\n❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, insertError.message);
        throw insertError;
      }

      insertedCount += batch.length;
      const percentage = Math.round((insertedCount / engagementRecords.length) * 100);
      process.stdout.write(`\r  Progress: ${insertedCount}/${engagementRecords.length} (${percentage}%)`);
    }

    console.log('\n✅ All engagement records inserted successfully');

    // Step 4: Refresh materialized view
    console.log('\n🔄 Refreshing engagement_counts materialized view...');
    const { error: refreshError } = await supabase.rpc('refresh_engagement_counts');

    if (refreshError) {
      console.error('❌ Error refreshing materialized view:', refreshError.message);
      console.log('Note: You may need to refresh it manually in Supabase dashboard');
    } else {
      console.log('✅ Materialized view refreshed successfully');
    }

    // Step 5: Verify results
    console.log('\n📊 Verification:');
    const { data: counts, error: countError } = await supabase
      .from('engagement_counts')
      .select('*');

    if (!countError && counts) {
      console.log(`  Total families with engagement: ${counts.length}`);
      const totalLikes = counts.reduce((sum, row) => sum + (row.likes_count || 0), 0);
      const totalShares = counts.reduce((sum, row) => sum + (row.shares_count || 0), 0);
      console.log(`  Total likes across all families: ${totalLikes}`);
      console.log(`  Total shares across all families: ${totalShares}`);
    }

    console.log('\n✨ Engagement data seeding complete!');
    console.log('🎉 All families now have realistic engagement counts\n');

  } catch (error) {
    console.error('\n❌ Fatal error during seeding:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
seedEngagementData();
