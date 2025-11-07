/**
 * Add Family Helper Script
 *
 * This script makes it easy to add crisis family profiles to the database.
 * You can use it to quickly populate your database with family data.
 *
 * Usage:
 *   npx ts-node scripts/addFamily.ts <path-to-json-file>
 *
 * Or run interactively:
 *   npx ts-node scripts/addFamily.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set');
  console.error('   Create a .env file in the root directory with these values');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Need {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface FamilyInput {
  name: string;
  location: string;
  situation: string;
  story: string;
  profile_image_url: string;
  cover_image_url?: string;
  video_url?: string;
  fundraising_link: string;
  fundraising_goal: number;
  fundraising_current: number;
  verified?: boolean;
  tags: string[];
  needs: Need[];
}

/**
 * Validate family data
 */
function validateFamilyData(data: any): data is FamilyInput {
  const required = [
    'name',
    'location',
    'situation',
    'story',
    'profile_image_url',
    'fundraising_link',
    'fundraising_goal',
    'fundraising_current',
    'tags',
    'needs',
  ];

  for (const field of required) {
    if (!(field in data)) {
      console.error(`❌ Missing required field: ${field}`);
      return false;
    }
  }

  // Validate tags is an array
  if (!Array.isArray(data.tags)) {
    console.error('❌ tags must be an array of strings');
    return false;
  }

  // Validate needs is an array
  if (!Array.isArray(data.needs)) {
    console.error('❌ needs must be an array of objects');
    return false;
  }

  // Validate each need has required fields
  for (const need of data.needs) {
    if (!need.id || !need.icon || !need.title || !need.description) {
      console.error('❌ Each need must have id, icon, title, and description');
      return false;
    }
  }

  return true;
}

/**
 * Add a family to the database
 */
async function addFamily(familyData: FamilyInput) {
  try {
    console.log('\n📝 Adding family to database...');
    console.log(`   Name: ${familyData.name}`);
    console.log(`   Location: ${familyData.location}`);

    const { data, error } = await supabase
      .from('crisis_families')
      .insert([
        {
          name: familyData.name,
          location: familyData.location,
          situation: familyData.situation,
          story: familyData.story,
          profile_image_url: familyData.profile_image_url,
          cover_image_url: familyData.cover_image_url || null,
          video_url: familyData.video_url || null,
          fundraising_link: familyData.fundraising_link,
          fundraising_goal: familyData.fundraising_goal,
          fundraising_current: familyData.fundraising_current,
          verified: familyData.verified || false,
          tags: familyData.tags,
          needs: familyData.needs,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting family:', error.message);
      return null;
    }

    console.log('\n✅ Family added successfully!');
    console.log(`   ID: ${data.id}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Location: ${data.location}`);
    if (data.video_url) {
      console.log(`   Video: ${data.video_url}`);
    }
    console.log(`   Fundraising: $${data.fundraising_current} / $${data.fundraising_goal}`);
    console.log(`   Profile: ${data.profile_image_url}`);
    console.log(`   Verified: ${data.verified ? 'Yes' : 'No'}`);
    console.log(`   Tags: ${data.tags.join(', ')}`);
    console.log(`   Needs: ${data.needs.length} item(s)`);

    return data;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return null;
  }
}

/**
 * Load family data from JSON file
 */
function loadFromFile(filePath: string): FamilyInput | null {
  try {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ File not found: ${absolutePath}`);
      return null;
    }

    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!validateFamilyData(data)) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error reading file:', error);
    return null;
  }
}

/**
 * Show example JSON structure
 */
function showExample() {
  console.log('\n📋 Example family JSON structure:\n');
  console.log(JSON.stringify({
    name: 'The Johnson Family',
    location: 'Aleppo, Syria',
    situation: 'Displaced by war',
    story: 'We fled our home in Aleppo in 2016 when the bombings intensified. Now living in a refugee camp with limited resources, we dream of rebuilding our lives and providing education for our children.',
    profile_image_url: 'https://your-supabase-url/storage/v1/object/public/family-images/johnson-profile.jpg',
    cover_image_url: 'https://your-supabase-url/storage/v1/object/public/family-images/johnson-cover.jpg',
    video_url: 'https://your-supabase-url/storage/v1/object/public/family-videos/johnson-story.mp4',
    fundraising_link: 'https://gofundme.com/johnson-family',
    fundraising_goal: 15000,
    fundraising_current: 5800,
    verified: true,
    tags: ['#Syria', '#War', '#Hope', '#Education'],
    needs: [
      {
        id: '1',
        icon: '🍲',
        title: 'Emergency Food Supply',
        description: 'Basic nutrition for family of 5',
      },
      {
        id: '2',
        icon: '🏥',
        title: 'Medical Care',
        description: 'Access to healthcare and medicine',
      },
      {
        id: '3',
        icon: '📚',
        title: 'Education',
        description: 'School supplies and tuition for children',
      },
    ],
  }, null, 2));
  console.log('\n');
}

/**
 * Main function
 */
async function main() {
  console.log('🌍 CrisisApp - Add Family Helper');
  console.log('=================================\n');

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: npx ts-node scripts/addFamily.ts <path-to-json-file>');
    showExample();
    console.log('💡 Save the JSON structure above to a file (e.g., family.json)');
    console.log('   Then run: npx ts-node scripts/addFamily.ts family.json\n');
    process.exit(0);
  }

  if (args[0] === '--help' || args[0] === '-h') {
    console.log('Usage: npx ts-node scripts/addFamily.ts <path-to-json-file>');
    showExample();
    process.exit(0);
  }

  const filePath = args[0];
  const familyData = loadFromFile(filePath);

  if (!familyData) {
    console.log('\n💡 Run with --help to see example JSON structure\n');
    process.exit(1);
  }

  const result = await addFamily(familyData);

  if (!result) {
    console.log('\n❌ Failed to add family to database\n');
    process.exit(1);
  }

  console.log('\n✨ Done!\n');
  process.exit(0);
}

// Run the script
main();
