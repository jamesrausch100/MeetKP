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
      bio: 'Software engineer by day, amateur chef by night. Looking for someone who appreciates both good code and good food. Probably overthinking this bio right now.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Brooklyn, NY',
      interests: ['cooking', 'hiking', 'tech', 'vinyl records', 'yoga'],
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
      bio: 'Nurse who actually loves her job. When I am not saving lives I am probably at a climbing gym or trying to keep my houseplants alive. 50/50 success rate on the plants.',
      gender: 'Woman',
      lookingFor: 'Everyone',
      location: 'Denver, CO',
      interests: ['rock climbing', 'plants', 'true crime podcasts', 'snowboarding', 'cooking'],
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
      bio: 'Former athlete turned startup founder. Still competitive about everything — board games, cooking, parallel parking. Looking for my co-pilot in this chaos.',
      gender: 'Man',
      lookingFor: 'Women',
      location: 'Chicago, IL',
      interests: ['startups', 'basketball', 'board games', 'travel', 'sushi'],
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
      bio: 'Veterinary student who talks to animals more than people. Looking for someone who won\'t judge me for having three cats. They\'re great cats though.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Seattle, WA',
      interests: ['animals', 'nature', 'movies', 'baking', 'gaming'],
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
      bio: 'Surf instructor and environmental science grad. Happiest when I\'m in the water or talking about saving it. Can probably beat you in a surfing contest.',
      gender: 'Man',
      lookingFor: 'Everyone',
      location: 'San Diego, CA',
      interests: ['surfing', 'environment', 'travel', 'cooking', 'diving'],
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
      bio: 'Data scientist who moonlights as a DJ. I can analyze your Spotify wrapped AND curate your next party playlist. Yes, those are my real skills.',
      gender: 'Woman',
      lookingFor: 'Men',
      location: 'Miami, FL',
      interests: ['data science', 'DJing', 'dancing', 'wine', 'travel'],
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
      photos: [],
      vibe: 'Just here to check things out',
      verified: false,
    },
  },
]

async function main() {
  console.log('Seeding MeetKP database...')

  // Clear existing data
  await prisma.message.deleteMany()
  await prisma.swipe.deleteMany()
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
          },
        },
      },
    })
    console.log(`  Created: ${demo.profile.name} (${demo.email})`)
  }

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
