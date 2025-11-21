/**
 * Import Text Posts Script
 *
 * Imports text updates from textPosts.json into the family_posts table
 * Calculates timestamps based on daysAgo for realistic chronological ordering
 *
 * Usage:
 * EXPO_PUBLIC_SUPABASE_URL="..." \
 * EXPO_PUBLIC_SUPABASE_ANON_KEY="..." \
 * npx ts-node scripts/importTextPosts.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TextPost {
  content: string;
  hashtags: string[];
  daysAgo: number;
}

interface FamilyPosts {
  familyId: string;
  familyName: string;
  posts: TextPost[];
}

/**
 * Calculate timestamp for a post based on days ago
 */
function getTimestamp(daysAgo: number): string {
  const now = new Date();
  const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return date.toISOString();
}

async function importTextPosts() {
  console.log('📝 Starting text posts import...\n');

  try {
    // Step 1: Read textPosts.json
    console.log('📖 Reading textPosts.json...');
    const jsonPath = path.join(__dirname, 'textPosts.json');

    if (!fs.existsSync(jsonPath)) {
      throw new Error(`File not found: ${jsonPath}`);
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const familiesData: FamilyPosts[] = JSON.parse(jsonData);

    console.log(`✅ Loaded data for ${familiesData.length} families\n`);

    // Step 2: Verify families exist in database
    console.log('🔍 Verifying families in database...');
    const familyIds = familiesData.map(f => f.familyId);

    const { data: families, error: familyError } = await supabase
      .from('crisis_families')
      .select('id, name')
      .in('id', familyIds);

    if (familyError) {
      throw new Error(`Failed to verify families: ${familyError.message}`);
    }

    if (!families || families.length !== familiesData.length) {
      console.warn(`⚠️  Warning: Found ${families?.length || 0} families in database, expected ${familiesData.length}`);
      console.warn('Some families may not exist in the database');
    } else {
      console.log(`✅ All ${families.length} families verified\n`);
    }

    // Step 3: Import posts for each family
    console.log('💾 Importing text posts...\n');
    let totalImported = 0;

    for (const familyData of familiesData) {
      console.log(`📝 ${familyData.familyName}:`);

      for (const post of familyData.posts) {
        const postData = {
          family_id: familyData.familyId,
          content: post.content,
          hashtags: post.hashtags,
          created_at: getTimestamp(post.daysAgo),
        };

        const { data, error } = await supabase
          .from('family_posts')
          .insert(postData)
          .select()
          .single();

        if (error) {
          console.error(`  ❌ Error importing post: ${error.message}`);
          console.error(`     Content: "${post.content.substring(0, 50)}..."`);
          continue;
        }

        totalImported++;
        const daysAgoText = post.daysAgo === 1 ? '1 day ago' : `${post.daysAgo} days ago`;
        console.log(`  ✅ Imported (${daysAgoText}): "${post.content.substring(0, 60)}..."`);
      }

      console.log('');
    }

    // Step 4: Verify results
    console.log(`\n📊 Import Summary:`);
    console.log(`  Total posts imported: ${totalImported}`);
    console.log(`  Families with posts: ${familiesData.length}`);
    console.log(`  Average posts per family: ${(totalImported / familiesData.length).toFixed(1)}`);

    // Step 5: Show recent posts
    console.log('\n📰 Most Recent Posts:');
    const { data: recentPosts, error: recentError } = await supabase
      .from('family_posts')
      .select(`
        id,
        content,
        created_at,
        family_id
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!recentError && recentPosts) {
      recentPosts.forEach((post, index) => {
        const date = new Date(post.created_at);
        const family = familiesData.find(f => f.familyId === post.family_id);
        console.log(`  ${index + 1}. [${date.toLocaleDateString()}] ${family?.familyName || 'Unknown'}`);
        console.log(`     "${post.content.substring(0, 80)}..."`);
      });
    }

    console.log('\n✨ Text posts import complete!');
    console.log('🎉 All family posts are now available in the database\n');

  } catch (error) {
    console.error('\n❌ Fatal error during import:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
importTextPosts();
