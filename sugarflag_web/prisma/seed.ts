import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sweeteners = [
  // Added Sugars
  {
    name: 'High Fructose Corn Syrup',
    type: 'added_sugar',
    aliases: ['HFCS', 'Corn Syrup', 'Fructose-Glucose Syrup', 'Glucose-Fructose Syrup'],
    description: 'Processed sweetener made from corn starch. Common in sodas and processed foods.',
    healthScore: 15,
  },
  {
    name: 'Cane Sugar',
    type: 'added_sugar',
    aliases: ['Sugar', 'Sucrose', 'White Sugar', 'Refined Sugar', 'Granulated Sugar'],
    description: 'Refined sugar from sugar cane. Most common sweetener.',
    healthScore: 25,
  },
  {
    name: 'Brown Sugar',
    type: 'added_sugar',
    aliases: ['Light Brown Sugar', 'Dark Brown Sugar', 'Turbinado'],
    description: 'Sugar with molasses. Slightly less processed than white sugar.',
    healthScore: 27,
  },
  {
    name: 'Dextrose',
    type: 'added_sugar',
    aliases: ['Glucose', 'Corn Sugar', 'D-Glucose'],
    description: 'Simple sugar (glucose) derived from corn. Rapidly absorbed.',
    healthScore: 20,
  },
  {
    name: 'Maltodextrin',
    type: 'added_sugar',
    aliases: ['Malto-Dextrin'],
    description: 'Processed carbohydrate from starch. Higher glycemic index than table sugar.',
    healthScore: 18,
  },
  {
    name: 'Honey',
    type: 'added_sugar',
    aliases: ['Raw Honey', 'Organic Honey'],
    description: 'Natural sweetener produced by bees. Contains trace nutrients.',
    healthScore: 40,
  },
  {
    name: 'Agave Nectar',
    type: 'added_sugar',
    aliases: ['Agave Syrup', 'Blue Agave'],
    description: 'Syrup from agave plant. Very high in fructose.',
    healthScore: 30,
  },
  {
    name: 'Maple Syrup',
    type: 'added_sugar',
    aliases: ['Pure Maple Syrup', 'Grade A Maple Syrup'],
    description: 'Natural syrup from maple trees. Contains some minerals.',
    healthScore: 45,
  },
  {
    name: 'Molasses',
    type: 'added_sugar',
    aliases: ['Blackstrap Molasses', 'Dark Molasses'],
    description: 'Byproduct of sugar refining. Contains minerals like iron.',
    healthScore: 35,
  },
  {
    name: 'Evaporated Cane Juice',
    type: 'added_sugar',
    aliases: ['Dehydrated Cane Juice', 'Dried Cane Syrup'],
    description: 'Minimally processed cane sugar. Marketing term for sugar.',
    healthScore: 26,
  },
  {
    name: 'Fruit Juice Concentrate',
    type: 'added_sugar',
    aliases: ['Apple Juice Concentrate', 'White Grape Concentrate', 'Pear Concentrate'],
    description: 'Concentrated fruit sugars. Still added sugar despite natural origin.',
    healthScore: 32,
  },
  {
    name: 'Invert Sugar',
    type: 'added_sugar',
    aliases: ['Inverted Sugar Syrup', 'Trimoline'],
    description: 'Mixture of glucose and fructose. Used in commercial baking.',
    healthScore: 22,
  },

  // Artificial Sweeteners
  {
    name: 'Aspartame',
    type: 'artificial',
    aliases: ['NutraSweet', 'Equal', 'Sugar Twin'],
    description: 'Low-calorie artificial sweetener. 200x sweeter than sugar.',
    healthScore: 35,
  },
  {
    name: 'Sucralose',
    type: 'artificial',
    aliases: ['Splenda'],
    description: 'Artificial sweetener derived from sugar. 600x sweeter than sugar.',
    healthScore: 40,
  },
  {
    name: 'Saccharin',
    type: 'artificial',
    aliases: ["Sweet'N Low", 'Sugar Twin'],
    description: 'One of the oldest artificial sweeteners. 300-400x sweeter than sugar.',
    healthScore: 30,
  },
  {
    name: 'Acesulfame Potassium',
    type: 'artificial',
    aliases: ['Acesulfame K', 'Ace-K', 'Sunett', 'Sweet One'],
    description: 'Calorie-free sweetener often blended with other sweeteners.',
    healthScore: 38,
  },
  {
    name: 'Neotame',
    type: 'artificial',
    aliases: ['Newtame'],
    description: 'Chemically similar to aspartame. 7,000-13,000x sweeter than sugar.',
    healthScore: 35,
  },
  {
    name: 'Advantame',
    type: 'artificial',
    aliases: [],
    description: 'Newest artificial sweetener. 20,000x sweeter than sugar.',
    healthScore: 37,
  },

  // Natural Alternatives
  {
    name: 'Stevia',
    type: 'natural_alternative',
    aliases: ['Stevia Extract', 'Rebiana', 'Reb-A', 'Truvia', 'PureVia'],
    description: 'Zero-calorie sweetener from stevia plant leaves. 200-300x sweeter than sugar.',
    healthScore: 85,
  },
  {
    name: 'Monk Fruit',
    type: 'natural_alternative',
    aliases: ['Luo Han Guo', 'Monk Fruit Extract', 'Lakanto'],
    description: 'Zero-calorie sweetener from monk fruit. 150-200x sweeter than sugar.',
    healthScore: 88,
  },
  {
    name: 'Erythritol',
    type: 'natural_alternative',
    aliases: ['Swerve', 'Truvia (contains erythritol)'],
    description: 'Sugar alcohol with almost no calories. 70% as sweet as sugar.',
    healthScore: 75,
  },
  {
    name: 'Xylitol',
    type: 'natural_alternative',
    aliases: ['Birch Sugar'],
    description: 'Sugar alcohol from plants. Same sweetness as sugar with fewer calories.',
    healthScore: 70,
  },
  {
    name: 'Allulose',
    type: 'natural_alternative',
    aliases: ['D-Psicose', 'RX Sugar'],
    description: 'Rare sugar found in nature. 70% as sweet as sugar with minimal calories.',
    healthScore: 80,
  },
  {
    name: 'Yacon Syrup',
    type: 'natural_alternative',
    aliases: [],
    description: 'Syrup from yacon root. Contains prebiotics and has lower glycemic impact.',
    healthScore: 65,
  },
  {
    name: 'Coconut Sugar',
    type: 'natural_alternative',
    aliases: ['Coconut Palm Sugar'],
    description: 'Sugar from coconut palm sap. Lower glycemic index than cane sugar.',
    healthScore: 50,
  },
  {
    name: 'Date Sugar',
    type: 'natural_alternative',
    aliases: ['Date Palm Sugar'],
    description: 'Made from dried dates. Contains fiber and nutrients.',
    healthScore: 55,
  },
]

async function main() {
  console.log('🌱 Seeding sweetener ontology...')

  // Create ontology version
  const version = await prisma.ontologyVersion.create({
    data: {
      version: '1.0.0',
      changelog: 'Initial sweetener ontology with 28 common sweeteners',
      active: true,
    },
  })

  console.log(`✅ Created ontology version: ${version.version}`)

  // Upsert sweeteners
  let created = 0
  let updated = 0

  for (const sweetener of sweeteners) {
    const result = await prisma.sweetener.upsert({
      where: { name: sweetener.name },
      update: {
        type: sweetener.type,
        aliases: sweetener.aliases,
        description: sweetener.description,
        healthScore: sweetener.healthScore,
      },
      create: sweetener,
    })

    if (result.createdAt === result.updatedAt) {
      created++
    } else {
      updated++
    }

    console.log(`  - ${sweetener.name} (${sweetener.type}, score: ${sweetener.healthScore})`)
  }

  console.log(`\n✅ Seeding complete!`)
  console.log(`   Created: ${created} sweeteners`)
  console.log(`   Updated: ${updated} sweeteners`)
  console.log(`   Total: ${sweeteners.length} sweeteners in ontology`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
