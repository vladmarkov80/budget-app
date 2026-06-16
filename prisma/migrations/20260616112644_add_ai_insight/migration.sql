-- CreateEnum
CREATE TYPE "AIInsightType" AS ENUM ('BUDGET_ANALYSIS', 'MEAL_PLAN');

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "type" "AIInsightType" NOT NULL,
    "content" TEXT NOT NULL,
    "month" INTEGER,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
