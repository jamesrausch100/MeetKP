import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const demoProfiles = [
  // === SCOTTSDALE / PHOENIX AREA (33.49, -111.93) ===
  {
    email: 'jessica@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Jessica',
      age: 26,
      bio: 'Pilates instructor who lives for brunch at the Montauk and sunset hikes at Camelback. Scottsdale born and raised.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Scottsdale, AZ',
      latitude: 33.4942,
      longitude: -111.9261,
      interests: ['pilates', 'hiking', 'brunch', 'photography', 'wine tasting'],
      personalityTags: ['Fitness Junkie', 'Early Bird', 'Outdoorsy'],
      promptAnswers: [
        { prompt: 'A perfect first date with me looks like...', answer: 'Sunrise hike at Camelback, then açaí bowls and people-watching in Old Town.' },
        { prompt: 'I get way too excited about...', answer: 'When the temperature drops below 100. It\'s like the whole city comes alive.' },
      ],
      photos: [],
      vibe: 'Desert sunshine and good energy',
      verified: true,
    },
  },
  {
    email: 'sofia@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Sofia',
      age: 24,
      bio: 'ASU grad working in marketing. Obsessed with the local food scene, thrift shopping on Mill Ave, and my two rescue dogs.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Tempe, AZ',
      latitude: 33.4255,
      longitude: -111.9400,
      interests: ['dogs', 'foodie scene', 'thrifting', 'marketing', 'live music'],
      personalityTags: ['Dog Person', 'Foodie', 'Spontaneous'],
      promptAnswers: [
        { prompt: 'The way to my heart is...', answer: 'Pet my dogs and tell me about a restaurant I haven\'t tried yet.' },
        { prompt: 'My friends would describe me as...', answer: 'The one who always knows where the new taco spot is before it\'s on Yelp.' },
      ],
      photos: [],
      vibe: 'Feed me tacos and tell me I\'m pretty',
      verified: true,
    },
  },
  {
    email: 'amber@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Amber',
      age: 28,
      bio: 'Nurse at HonorHealth by day, amateur sommelier by night. You can find me at Winery 101 or doing yoga in the park.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Scottsdale, AZ',
      latitude: 33.5091,
      longitude: -111.8990,
      interests: ['wine', 'yoga', 'nursing', 'travel', 'cooking'],
      personalityTags: ['Chill', 'Romantic', 'Foodie'],
      promptAnswers: [
        { prompt: 'I\'m looking for someone who...', answer: 'Can keep up a conversation about anything, doesn\'t ghost, and thinks planning a date is fun not a chore.' },
        { prompt: 'The most spontaneous thing I\'ve done is...', answer: 'Drove to Sedona at midnight with my best friend just because the stars were insane that night.' },
      ],
      photos: [],
      vibe: 'Wine > whine',
      verified: true,
    },
  },
  {
    email: 'chloe@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Chloe',
      age: 25,
      bio: 'Real estate agent who actually loves her job. Moved here from LA two years ago and never looked back. Desert girl now.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Paradise Valley, AZ',
      latitude: 33.5310,
      longitude: -111.9425,
      interests: ['real estate', 'interior design', 'hiking', 'tennis', 'golf'],
      personalityTags: ['Ambitious', 'Extrovert', 'Planner'],
      promptAnswers: [
        { prompt: 'A perfect first date with me looks like...', answer: 'Drinks at a rooftop bar with a mountain view, then dinner somewhere we can actually hear each other talk.' },
        { prompt: 'My most controversial opinion is...', answer: 'Scottsdale > LA. Better sunsets, less traffic, and people are actually nice.' },
      ],
      photos: [],
      vibe: 'Closing deals and opening doors',
      verified: true,
    },
  },
  {
    email: 'mia@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Mia',
      age: 23,
      bio: 'Bartender at Maple & Ash. Dance minor from U of A. I make the best spicy margs in the valley and that\'s not debatable.',
      gender: 'Woman',
      lookingFor: 'Everyone',
      location: 'Old Town Scottsdale, AZ',
      latitude: 33.4928,
      longitude: -111.9206,
      interests: ['mixology', 'dancing', 'music festivals', 'cooking', 'art'],
      personalityTags: ['Night Owl', 'Creative', 'Spontaneous'],
      promptAnswers: [
        { prompt: 'Two truths and a lie about me:', answer: 'I can salsa dance, I\'ve never been to Mexico, I once made a cocktail for a celebrity and played it cool.' },
        { prompt: 'On a Sunday morning you\'ll find me...', answer: 'Making pancakes with leftover fruit from the bar and blasting Fleetwood Mac.' },
      ],
      photos: [],
      vibe: 'Shaking things up, literally',
      verified: false,
    },
  },
  {
    email: 'rachel@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Rachel',
      age: 29,
      bio: 'Physical therapist and weekend warrior. If it involves mountains, water, or a good playlist, I\'m in.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Phoenix, AZ',
      latitude: 33.4484,
      longitude: -112.0740,
      interests: ['hiking', 'kayaking', 'fitness', 'podcasts', 'camping'],
      personalityTags: ['Adventurous', 'Fitness Junkie', 'Early Bird'],
      promptAnswers: [
        { prompt: 'I get way too excited about...', answer: 'Finding a new trail I\'ve never done. I literally research hikes like other people research restaurants.' },
        { prompt: 'The way to my heart is...', answer: 'Show up on time, be kind to waitstaff, and don\'t bail on plans last minute.' },
      ],
      photos: [],
      vibe: 'Adventure is out there and so am I',
      verified: true,
    },
  },
  {
    email: 'taylor@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Taylor',
      age: 27,
      bio: 'Software dev at a startup downtown. Moved from Austin last year. Still looking for decent breakfast tacos in this city.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Scottsdale, AZ',
      latitude: 33.4890,
      longitude: -111.9260,
      interests: ['tech', 'tacos', 'board games', 'yoga', 'travel'],
      personalityTags: ['Nerdy', 'Introvert', 'Foodie'],
      promptAnswers: [
        { prompt: 'My hidden talent is...', answer: 'I can code and carry a conversation at the same time. Multithreading IRL.' },
        { prompt: 'I\'m looking for someone who...', answer: 'Gets excited about random Wikipedia rabbit holes and doesn\'t think "staying in" is boring.' },
      ],
      photos: [],
      vibe: 'Building apps and chasing sunsets',
      verified: true,
    },
  },

  // === OTHER CITIES (with lat/long now) ===
  {
    email: 'alex@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Alex',
      age: 26,
      bio: 'Software engineer by day, amateur chef by night. Looking for someone who appreciates both good code and good food.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Brooklyn, NY',
      latitude: 40.6782,
      longitude: -73.9442,
      interests: ['cooking', 'hiking', 'tech', 'vinyl records', 'yoga'],
      personalityTags: ['Creative', 'Foodie', 'Night Owl'],
      promptAnswers: [
        { prompt: 'The way to my heart is...', answer: 'A home-cooked meal and a good conversation about something neither of us is an expert in.' },
        { prompt: 'I get way too excited about...', answer: 'Farmers markets. I will spend 2 hours there and come home with 4 bags of produce I don\'t know how to use.' },
      ],
      photos: [],
      vibe: 'Will debug your code and your heart',
      verified: true,
    },
  },
  {
    email: 'jordan@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Jordan',
      age: 29,
      bio: 'Musician and part-time philosopher. I believe the best conversations happen after midnight. Swipe right if you can handle spontaneous road trips.',
      gender: 'Man',
      lookingFor: 'Women',
      location: 'Austin, TX',
      latitude: 30.2672,
      longitude: -97.7431,
      interests: ['music', 'philosophy', 'road trips', 'coffee', 'photography'],
      personalityTags: ['Spontaneous', 'Night Owl', 'Creative'],
      promptAnswers: [
        { prompt: 'A perfect first date with me looks like...', answer: 'Finding a live jazz bar we\'ve never been to, ordering whatever the bartender recommends, talking until they kick us out.' },
        { prompt: 'My most controversial opinion is...', answer: 'Breakfast food is overrated. There, I said it.' },
      ],
      photos: [],
      vibe: 'Late night talks & early morning coffee',
      verified: true,
    },
  },
  {
    email: 'sam@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Sam',
      age: 24,
      bio: 'Graphic designer with a weakness for bookstores and tacos. My love language is sharing playlists. Currently reading way too many books at once.',
      gender: 'Non-binary',
      lookingFor: 'Everyone',
      location: 'Portland, OR',
      latitude: 45.5155,
      longitude: -122.6789,
      interests: ['design', 'reading', 'tacos', 'indie music', 'art galleries'],
      personalityTags: ['Bookworm', 'Creative', 'Introvert'],
      promptAnswers: [
        { prompt: 'On a Sunday morning you\'ll find me...', answer: 'In a corner of a coffee shop with three books open, pretending to read all of them at once.' },
      ],
      photos: [],
      vibe: 'Making the world prettier, one pixel at a time',
      verified: false,
    },
  },
  {
    email: 'maya@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Maya',
      age: 27,
      bio: 'Nurse who actually loves her job. When I\'m not saving lives I\'m probably at a climbing gym or trying to keep my houseplants alive.',
      gender: 'Woman',
      lookingFor: 'Everyone',
      location: 'Denver, CO',
      latitude: 39.7392,
      longitude: -104.9903,
      interests: ['rock climbing', 'plants', 'true crime podcasts', 'snowboarding', 'cooking'],
      personalityTags: ['Adventurous', 'Outdoorsy', 'Plant Parent'],
      promptAnswers: [
        { prompt: 'The most spontaneous thing I\'ve done is...', answer: 'Booked a one-way flight to Iceland because flights were $200. Figured out the rest when I landed.' },
        { prompt: 'My friends would describe me as...', answer: 'The one who somehow makes every hangout an adventure but also gives the best hugs.' },
      ],
      photos: [],
      vibe: 'Adrenaline junkie with a nurturing side',
      verified: true,
    },
  },
  {
    email: 'marcus@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Marcus',
      age: 31,
      bio: 'Former athlete turned startup founder. Still competitive about everything — board games, cooking, parallel parking.',
      gender: 'Man',
      lookingFor: 'Women',
      location: 'Chicago, IL',
      latitude: 41.8781,
      longitude: -87.6298,
      interests: ['startups', 'basketball', 'board games', 'travel', 'sushi'],
      personalityTags: ['Ambitious', 'Extrovert', 'Fitness Junkie'],
      promptAnswers: [
        { prompt: 'I\'m looking for someone who...', answer: 'Can trash talk me at Scrabble and mean it. Bonus points if you can also cook.' },
        { prompt: 'Two truths and a lie about me:', answer: 'I\'ve run a marathon, I once ate 47 chicken wings in one sitting, I can play piano.' },
      ],
      photos: [],
      vibe: 'Building things and breaking records',
      verified: true,
    },
  },
  {
    email: 'riley@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Riley',
      age: 25,
      bio: 'Veterinary student who talks to animals more than people. Looking for someone who won\'t judge me for having three cats.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Seattle, WA',
      latitude: 47.6062,
      longitude: -122.3321,
      interests: ['animals', 'nature', 'movies', 'baking', 'gaming'],
      personalityTags: ['Cat Person', 'Homebody', 'Gamer'],
      promptAnswers: [
        { prompt: 'My hidden talent is...', answer: 'I can tell what breed a dog is from like 100 feet away. It\'s not useful but it\'s mine.' },
      ],
      photos: [],
      vibe: 'Crazy cat lady in training',
      verified: false,
    },
  },
  {
    email: 'kai@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Kai',
      age: 28,
      bio: 'Surf instructor and environmental science grad. Happiest when I\'m in the water or talking about saving it.',
      gender: 'Man',
      lookingFor: 'Everyone',
      location: 'San Diego, CA',
      latitude: 32.7157,
      longitude: -117.1611,
      interests: ['surfing', 'environment', 'travel', 'cooking', 'diving'],
      personalityTags: ['Adventurous', 'Outdoorsy', 'Chill'],
      promptAnswers: [
        { prompt: 'A perfect first date with me looks like...', answer: 'Sunset surf session, tacos on the beach, and seeing who can skip a rock the farthest.' },
        { prompt: 'I get way too excited about...', answer: 'The weather forecast. If the swell report looks good, I\'m canceling everything.' },
      ],
      photos: [],
      vibe: 'Catch waves, not feelings... wait',
      verified: true,
    },
  },
  {
    email: 'nina@demo.meetkp.com',
    password: 'demo123',
    profile: {
      name: 'Nina',
      age: 30,
      bio: 'Data scientist who moonlights as a DJ. I can analyze your Spotify wrapped AND curate your next party playlist.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Miami, FL',
      latitude: 25.7617,
      longitude: -80.1918,
      interests: ['data science', 'DJing', 'dancing', 'wine', 'travel'],
      personalityTags: ['Night Owl', 'Analytical', 'Extrovert'],
      promptAnswers: [
        { prompt: 'My most controversial opinion is...', answer: 'People who say "I listen to everything" actually listen to nothing. Have an opinion.' },
        { prompt: 'The way to my heart is...', answer: 'Send me a song that made you feel something. If it slaps, we\'re going on a date.' },
      ],
      photos: [],
      vibe: 'Dropping beats and p-values',
      verified: true,
    },
  },
  {
    email: 'demo@meetkp.com',
    password: 'demo123',
    profile: {
      name: 'You (Demo)',
      age: 25,
      bio: 'This is a demo account. Create your own profile to get the full MeetKP experience!',
      gender: 'Man',
      lookingFor: 'Women',
      location: 'Scottsdale, AZ',
      latitude: 33.4942,
      longitude: -111.9261,
      interests: ['exploring', 'meetkp', 'connections', 'hiking', 'food'],
      personalityTags: ['Adventurous', 'Spontaneous'],
      promptAnswers: [],
      photos: [],
      vibe: 'Just here to check things out',
      verified: false,
    },
  },
]

async function main() {
  console.log('Seeding MeetKP database...')

  await prisma.message.deleteMany()
  await prisma.swipe.deleteMany()
  await prisma.datePlan.deleteMany()
  await prisma.block.deleteMany()
  await prisma.report.deleteMany()
  await prisma.referral.deleteMany()
  await prisma.inviteCode.deleteMany()
  await prisma.icebreaker.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  for (const demo of demoProfiles) {
    const passwordHash = await bcrypt.hash(demo.password, 12)
    await prisma.user.create({
      data: {
        email: demo.email,
        passwordHash,
        profile: {
          create: {
            name: demo.profile.name,
            age: demo.profile.age,
            bio: demo.profile.bio,
            gender: demo.profile.gender,
            lookingFor: demo.profile.lookingFor,
            location: demo.profile.location,
            latitude: demo.profile.latitude ?? null,
            longitude: demo.profile.longitude ?? null,
            interests: JSON.stringify(demo.profile.interests),
            photos: JSON.stringify(demo.profile.photos),
            vibe: demo.profile.vibe,
            verified: demo.profile.verified,
            personalityTags: JSON.stringify(demo.profile.personalityTags),
            promptAnswers: JSON.stringify(demo.profile.promptAnswers),
            photoVerified: demo.profile.verified,
            profileCompleteness: 80,
          },
        },
      },
    })
    console.log(`  Created: ${demo.profile.name} (${demo.email}) — ${demo.profile.location}`)
  }

  // Seed icebreakers
  const { ICEBREAKERS } = await import('../src/lib/icebreakers')
  for (const ib of ICEBREAKERS) {
    await prisma.icebreaker.create({
      data: { category: ib.category, text: ib.text },
    })
  }
  console.log(`  Created ${ICEBREAKERS.length} icebreakers`)

  console.log(`\nSeeded ${demoProfiles.length} profiles (7 in Scottsdale/Phoenix area).`)
  console.log('\nDemo login: demo@meetkp.com / demo123 (located in Scottsdale)')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
