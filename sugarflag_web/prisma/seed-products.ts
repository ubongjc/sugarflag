import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProducts = [
  {
    upc: '012000161551',
    brand: 'Coca-Cola',
    name: 'Coca-Cola Classic',
    description: 'Carbonated soft drink',
    servingSize: '12 fl oz (355mL)',
    calories: 140,
    totalSugars: 39,
    addedSugars: 39,
    totalCarbs: 39,
    protein: 0,
    fat: 0,
    sodium: 45,
    fiber: 0,
    ingredients: 'Carbonated Water, High Fructose Corn Syrup, Caramel Color, Phosphoric Acid, Natural Flavors, Caffeine',
    sweeteners: [
      { name: 'High Fructose Corn Syrup', position: 2 },
    ],
  },
  {
    upc: '049000028904',
    brand: 'Pepsi',
    name: 'Pepsi Cola',
    description: 'Carbonated soft drink',
    servingSize: '12 fl oz (355mL)',
    calories: 150,
    totalSugars: 41,
    addedSugars: 41,
    totalCarbs: 41,
    protein: 0,
    fat: 0,
    sodium: 30,
    fiber: 0,
    ingredients: 'Carbonated Water, High Fructose Corn Syrup, Caramel Color, Sugar, Phosphoric Acid, Caffeine, Citric Acid, Natural Flavor',
    sweeteners: [
      { name: 'High Fructose Corn Syrup', position: 2 },
      { name: 'Cane Sugar', position: 4 },
    ],
  },
  {
    upc: '078000113204',
    brand: 'Gatorade',
    name: 'Gatorade Thirst Quencher - Lemon Lime',
    description: 'Sports drink',
    servingSize: '12 fl oz',
    calories: 80,
    totalSugars: 21,
    addedSugars: 21,
    totalCarbs: 21,
    protein: 0,
    fat: 0,
    sodium: 160,
    fiber: 0,
    ingredients: 'Water, Sugar, Dextrose, Citric Acid, Salt, Sodium Citrate, Monopotassium Phosphate, Natural Flavor, Yellow 5',
    sweeteners: [
      { name: 'Cane Sugar', position: 2 },
      { name: 'Dextrose', position: 3 },
    ],
  },
  {
    upc: '085239012598',
    brand: "Justin's",
    name: 'Classic Almond Butter',
    description: 'Natural almond butter',
    servingSize: '2 Tbsp (32g)',
    calories: 190,
    totalSugars: 2,
    addedSugars: 0,
    totalCarbs: 7,
    protein: 7,
    fat: 16,
    sodium: 0,
    fiber: 3,
    ingredients: 'Dry Roasted Almonds, Palm Oil',
    sweeteners: [],
  },
  {
    upc: '070470002075',
    brand: 'Fage',
    name: 'Total 0% Greek Yogurt',
    description: 'Nonfat Greek yogurt',
    servingSize: '3/4 cup (170g)',
    calories: 90,
    totalSugars: 5,
    addedSugars: 0,
    totalCarbs: 6,
    protein: 18,
    fat: 0,
    sodium: 65,
    fiber: 0,
    ingredients: 'Grade A Pasteurized Skimmed Milk, Live Active Yogurt Cultures',
    sweeteners: [],
  },
  {
    upc: '041303002230',
    brand: "Dave's Killer Bread",
    name: '21 Whole Grains and Seeds',
    description: 'Organic whole grain bread',
    servingSize: '1 slice (48g)',
    calories: 120,
    totalSugars: 5,
    addedSugars: 3,
    totalCarbs: 22,
    protein: 5,
    fat: 1.5,
    sodium: 170,
    fiber: 5,
    ingredients: 'Organic Whole Wheat, Water, Organic Cane Sugar, Organic Cracked Whole Wheat, Organic Sunflower Seeds, Organic Oats, Contains 2% or less of: Organic Flax Seeds, Organic Sesame Seeds, Organic Rye, Organic Triticale, Organic Pumpkin Seeds, Organic Barley, Organic Spelt, Organic Millet, Sea Salt, Organic Wheat Gluten, Cultured Wheat Flour, Organic Vinegar, Organic Molasses, Organic Cornmeal, Organic Rolled Oats, Yeast',
    sweeteners: [
      { name: 'Cane Sugar', position: 3 },
      { name: 'Molasses', position: 21 },
    ],
  },
  {
    upc: '041190468492',
    brand: 'Lindt',
    name: 'Excellence 85% Cocoa Dark Chocolate',
    description: 'Premium dark chocolate',
    servingSize: '4 squares (40g)',
    calories: 230,
    totalSugars: 7,
    addedSugars: 6,
    totalCarbs: 14,
    protein: 4,
    fat: 19,
    sodium: 0,
    fiber: 6,
    ingredients: 'Chocolate, Cocoa Butter, Cocoa Powder Processed with Alkali, Sugar, Bourbon Vanilla Beans',
    sweeteners: [
      { name: 'Cane Sugar', position: 4 },
    ],
  },
  {
    upc: '052603051859',
    brand: 'Quaker',
    name: 'Steel Cut Oats',
    description: 'Whole grain oats',
    servingSize: '1/4 cup dry (40g)',
    calories: 150,
    totalSugars: 0,
    addedSugars: 0,
    totalCarbs: 27,
    protein: 5,
    fat: 2.5,
    sodium: 0,
    fiber: 4,
    ingredients: '100% Whole Grain Steel Cut Oats',
    sweeteners: [],
  },
  {
    upc: '074175434120',
    brand: 'LaCroix',
    name: 'Sparkling Water - Lime',
    description: 'Naturally flavored sparkling water',
    servingSize: '12 fl oz (355mL)',
    calories: 0,
    totalSugars: 0,
    addedSugars: 0,
    totalCarbs: 0,
    protein: 0,
    fat: 0,
    sodium: 0,
    fiber: 0,
    ingredients: 'Carbonated Water, Natural Flavors',
    sweeteners: [],
  },
  {
    upc: '038000291807',
    brand: 'General Mills',
    name: 'Cheerios',
    description: 'Toasted whole grain oat cereal',
    servingSize: '1 cup (28g)',
    calories: 100,
    totalSugars: 1,
    addedSugars: 1,
    totalCarbs: 20,
    protein: 3,
    fat: 2,
    sodium: 140,
    fiber: 3,
    ingredients: 'Whole Grain Oats, Modified Corn Starch, Sugar, Salt, Tripotassium Phosphate',
    sweeteners: [
      { name: 'Cane Sugar', position: 3 },
    ],
  },
]

async function main() {
  console.log('🌱 Seeding sample products...')

  let created = 0
  let updated = 0
  let sweetenersLinked = 0

  for (const productData of sampleProducts) {
    const { sweeteners: sweetenerData, ...productFields } = productData

    // Create or update product
    const product = await prisma.product.upsert({
      where: { upc: productData.upc },
      update: productFields,
      create: productFields,
    })

    if (product.createdAt === product.updatedAt) {
      created++
    } else {
      updated++
    }

    // Link sweeteners
    for (const sweetenerInfo of sweetenerData) {
      const sweetener = await prisma.sweetener.findUnique({
        where: { name: sweetenerInfo.name },
      })

      if (sweetener) {
        await prisma.productSweetener.upsert({
          where: {
            productId_sweetenerId: {
              productId: product.id,
              sweetenerId: sweetener.id,
            },
          },
          update: {
            position: sweetenerInfo.position,
          },
          create: {
            productId: product.id,
            sweetenerId: sweetener.id,
            position: sweetenerInfo.position,
          },
        })
        sweetenersLinked++
      }
    }

    console.log(`  - ${product.brand} ${product.name} (${product.upc})`)
  }

  console.log(`\n✅ Seeding complete!`)
  console.log(`   Created: ${created} products`)
  console.log(`   Updated: ${updated} products`)
  console.log(`   Sweeteners linked: ${sweetenersLinked}`)
  console.log(`   Total: ${sampleProducts.length} products`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
