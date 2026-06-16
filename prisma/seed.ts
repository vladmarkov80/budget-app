import { PrismaClient, Role } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      passwordHash: "placeholder",
      name: "Vladimir",
    },
  })

  // Create household
  const household = await prisma.household.create({
    data: {
      name: "Markov Family",
      currency: "RSD",
      createdById: user.id,
    },
  })

  // Create membership
  await prisma.householdMember.create({
    data: {
      userId: user.id,
      householdId: household.id,
      role: Role.OWNER,
    },
  })

  // Create default categories
  const categories = [
    { name: "Groceries", icon: "🛒", color: "#4CAF50" },
    { name: "Rent", icon: "🏠", color: "#2196F3" },
    { name: "Utilities", icon: "💡", color: "#FF9800" },
    { name: "Transport", icon: "🚗", color: "#9C27B0" },
    { name: "Salary", icon: "💰", color: "#00BCD4" },
  ]

  for (const category of categories) {
    await prisma.category.create({
      data: {
        householdId: household.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        isDefault: true,
      },
    })
  }

  console.log("Seed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })