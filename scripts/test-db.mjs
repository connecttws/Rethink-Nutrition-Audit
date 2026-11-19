import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking rethink_nutri_audit table...");
  const count = await prisma.rethinkNutriAudit.count();
  console.log("Current record count in rethink_nutri_audit:", count);

  const testRecord = await prisma.rethinkNutriAudit.create({
    data: {
      businessName: "Priya Sharma",
      clientName: "Priya Sharma",
      category: "Drop Visceral Belly Fat & Lose 8-12 kg",
      locality: "34 yrs • Female • Vegetarian (Dairy)",
      phone: "+91 98765 43210",
      whatsappNumber: "9876543210",
      auditorName: "Rethink Clinical Nutritionist",
      age: "34",
      height: "162",
      weight: "76",
      bmi: "29.0",
      bmiCategory: "Overweight",
      primaryGoal: "Drop Visceral Belly Fat & Lose 8-12 kg",
      biometrics: {
        age: "34",
        biologicalSex: "Female",
        dietPreference: "Vegetarian (Dairy)",
        heightCm: "162",
        weightKg: "76",
        targetWeightKg: "60",
        bmi: "29.0",
        bmiCategory: "Overweight",
        optimalMinKg: "49",
        optimalMaxKg: "65",
        weightGapKg: "-16.0 kg",
        proteinNeedMin: "91",
        proteinNeedMax: "114",
      },
      totalScore: 52,
      maxScore: 100,
      percentage: 52,
      bandTitle: "Moderate Deficit / Macro Inconsistency",
      bandRange: "40–69",
      bandHeadline: "Good Intentions With Major Hidden Calorie & Protein Gaps",
      bandDescription: "Targeted clinical nutrition needed to eliminate hidden liquid leaks and boost protein distribution.",
      sprintRecommendation: "Rethink 8-Week Visceral Belly & Fat Loss Accelerator",
      sprintDetails: "Calibrated meal templates and WhatsApp accountability.",
      mapsScore: 6,
      visualsScore: 9,
      webScore: 12,
      adsScore: 11,
      speedScore: 8,
      sectionScores: [],
      answers: {},
      findings: [],
    },
  });

  console.log("Successfully created test record with ID:", testRecord.id);

  const retrieved = await prisma.rethinkNutriAudit.findUnique({
    where: { id: testRecord.id },
  });
  console.log("Retrieved test record:", retrieved?.businessName, retrieved?.category, retrieved?.totalScore);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
