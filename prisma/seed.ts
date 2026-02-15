import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const demoProfiles = [
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
      gender: 'Other',
      lookingFor: 'Everyone',
      location: 'Everywhere',
      interests: ['exploring', 'meetkp', 'connections'],
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
            interests: JSON.stringify(demo.profile.interests),
            photos: JSON.stringify(demo.profile.photos),
            vibe: demo.profile.vibe,
            verified: demo.profile.verified,
            personalityTags: JSON.stringify(demo.profile.personalityTags),
            promptAnswers: JSON.stringify(demo.profile.promptAnswers),
            photoVerified: demo.profile.verified,
            profileCompleteness: 75,
          },
        },
      },
    })
    console.log(`  Created: ${demo.profile.name} (${demo.email})`)
  }

  // Seed icebreakers
  const { ICEBREAKERS } = await import('../src/lib/icebreakers')
  for (const ib of ICEBREAKERS) {
    await prisma.icebreaker.create({
      data: { category: ib.category, text: ib.text },
    })
  }
  console.log(`  Created ${ICEBREAKERS.length} icebreakers`)

  console.log(`\nSeeded ${demoProfiles.length} demo profiles.`)
  console.log('\nDemo login: demo@meetkp.com / demo123')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
