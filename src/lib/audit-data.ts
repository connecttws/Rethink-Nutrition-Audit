export interface AnswerOption {
  text: string;
  points: number;
  hint?: string;
  badge?: string;
}

export interface Question {
  id: string;
  sectionId: string;
  numberStr: string; // e.g. "1.1", "1.2"
  text: string;
  description: string;
  options: AnswerOption[];
}

export interface AuditSection {
  id: string;
  name: string;
  shortName: string;
  pillarNumber: number;
  icon: string;
  maxPoints: number;
  subtitle: string;
  questions: Question[];
}

export interface ClientDetails {
  name: string; // Client Full Name: Priya Sharma
  clientName?: string;
  category: string; // Primary Nutritional Target
  locality: string; // Summary of Diet Preference & Biometrics
  phone?: string;
  whatsappNumber?: string;
  mapsUrl?: string;
  auditorName?: string; // Clinical Nutritionist
  age?: string;
  biologicalSex?: "Female" | "Male";
  dietPreference?: string;
  heightCm?: string;
  heightFt?: string;
  heightIn?: string;
  heightUnit?: "cm" | "ft";
  weightKg?: string;
  targetWeightKg?: string;
  bmi?: string;
  bmiCategory?: string;
  optimalMinKg?: string;
  optimalMaxKg?: string;
  weightGapKg?: string;
  proteinNeedMin?: string;
  proteinNeedMax?: string;
  goal?: string;
}

export type BusinessDetails = ClientDetails;
export type MemberDetails = ClientDetails;

export function formatTitleCase(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function cleanPhoneNumber(rawPhone: string): string {
  const digits = (rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.length === 11 && digits.startsWith("0")) return "91" + digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export function isValidIndianMobile(rawPhone: string): boolean {
  const digits = (rawPhone || "").replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
}

export function formatWhatsAppUrl(rawPhone: string, message: string): string {
  const cleanNumber = cleanPhoneNumber(rawPhone);
  const encodedText = encodeURIComponent(message);
  if (cleanNumber && cleanNumber.length >= 10) {
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

// ==========================================
// BIOMETRICS & NUTRITIONAL CALCULATION ENGINE
// ==========================================

export interface BmiAnalysis {
  bmi: number;
  formattedBmi: string;
  category: "Underweight" | "Normal" | "Overweight" | "Obese";
  categoryColor: string;
  optimalMinKg: number;
  optimalMaxKg: number;
  healthyRangeText: string;
  deltaKg: number;
  weightGapText: string;
  proteinNeedMin: number;
  proteinNeedMax: number;
  proteinNeedText: string;
  summary: string;
}

export function calculateBmi(
  heightCmRaw: number | string,
  weightKgRaw: number | string,
  targetWeightRaw?: number | string
): BmiAnalysis | null {
  const hCm = typeof heightCmRaw === "string" ? parseFloat(heightCmRaw) : heightCmRaw;
  const wKg = typeof weightKgRaw === "string" ? parseFloat(weightKgRaw) : weightKgRaw;

  if (!hCm || hCm <= 50 || hCm > 250 || !wKg || wKg <= 20 || wKg > 300) {
    return null;
  }

  const hMeters = hCm / 100;
  const rawBmi = wKg / (hMeters * hMeters);
  const bmi = Math.round(rawBmi * 10) / 10;

  // Safe optimal target weight range based on standard 18.5 - 24.9 BMI
  const optimalMinKg = Math.round(18.5 * hMeters * hMeters);
  const optimalMaxKg = Math.round(24.9 * hMeters * hMeters);
  const healthyRangeText = `Healthy: ${optimalMinKg} - ${optimalMaxKg} kg`;

  // Weight Gap calculation
  let weightGapText = "";
  let deltaKg = 0;
  if (targetWeightRaw) {
    const tKg = typeof targetWeightRaw === "string" ? parseFloat(targetWeightRaw) : targetWeightRaw;
    if (tKg && tKg > 0) {
      const diff = Math.round((tKg - wKg) * 10) / 10;
      deltaKg = diff;
      weightGapText = diff > 0 ? `+${diff.toFixed(1)} kg` : `${diff.toFixed(1)} kg`;
    }
  }

  if (!weightGapText) {
    if (wKg > optimalMaxKg) {
      const excess = Math.round((wKg - optimalMaxKg) * 10) / 10;
      deltaKg = -excess;
      weightGapText = `-${excess.toFixed(1)} kg`;
    } else if (wKg < optimalMinKg) {
      const deficit = Math.round((optimalMinKg - wKg) * 10) / 10;
      deltaKg = deficit;
      weightGapText = `+${deficit.toFixed(1)} kg`;
    } else {
      weightGapText = "0.0 kg";
    }
  }

  // Protein need calculation: 1.2g to 1.5g per kg of current body weight
  const proteinNeedMin = Math.round(wKg * 1.2);
  const proteinNeedMax = Math.round(wKg * 1.5);
  const proteinNeedText = `${proteinNeedMin} - ${proteinNeedMax}g / day`;

  let category: BmiAnalysis["category"] = "Normal";
  let categoryColor = "#10B981"; // Emerald
  let summary = "Optimal body mass index within recommended metabolic ranges.";

  if (bmi < 18.5) {
    category = "Underweight";
    categoryColor = "#F59E0B"; // Amber
    summary = `Below metabolic baseline. Structured caloric surplus and gut absorption coaching recommended.`;
  } else if (bmi <= 24.9) {
    category = "Normal";
    categoryColor = "#10B981"; // Emerald
    summary = "Ideal metabolic BMI index. Focus on visceral fat reduction and lean muscle preservation.";
  } else if (bmi <= 29.9) {
    category = "Overweight";
    categoryColor = "#F97316"; // Orange
    summary = `Elevated metabolic BMI. Targeted visceral fat reduction and insulin sensitivity protocol recommended.`;
  } else {
    category = "Obese";
    categoryColor = "#EF4444"; // Rose
    summary = `High metabolic drag & visceral adipose load. Therapeutic clinical nutrition protocol needed.`;
  }

  return {
    bmi,
    formattedBmi: bmi.toFixed(1),
    category,
    categoryColor,
    optimalMinKg,
    optimalMaxKg,
    healthyRangeText,
    deltaKg,
    weightGapText,
    proteinNeedMin,
    proteinNeedMax,
    proteinNeedText,
    summary,
  };
}

export function convertFtInToCm(feet: number, inches: number): number {
  const totalInches = (feet || 0) * 12 + (inches || 0);
  return Math.round(totalInches * 2.54);
}

export function convertCmToFtIn(cm: number): { feet: number; inches: number } {
  if (!cm || cm <= 0) return { feet: 0, inches: 0 };
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

// ==========================================
// CLINICAL NUTRITIONAL TARGETS & PREFERENCES
// ==========================================

export const NUTRITIONAL_TARGETS = [
  {
    name: "Drop Visceral Belly Fat & Lose 8-12 kg",
    icon: "Flame",
    subtitle: "Reverse central adiposity, caloric leaks & insulin resistance",
  },
  {
    name: "Reverse Insulin Resistance & Pre-Diabetes",
    icon: "HeartPulse",
    subtitle: "HbA1c optimization, glycemic control & post-meal stabilization",
  },
  {
    name: "Gut Dysbiosis & Chronic Bloat Protocol",
    icon: "ShieldAlert",
    subtitle: "Microbiome repair, digestive transit & anti-inflammatory nutrition",
  },
  {
    name: "Thyroid & PCOS Metabolic Rebalance",
    icon: "Target",
    subtitle: "Hormonal co-factors, estrogen/androgen regulation & weight release",
  },
  {
    name: "Fatty Liver Grade 1/2 Clinical Reversal",
    icon: "Activity",
    subtitle: "Eliminate hepatic lipid accumulation & liquid fructose load",
  },
  {
    name: "Lean Muscle Recomp & Metabolic Repair",
    icon: "Dumbbell",
    subtitle: "High-protein satiety, progressive surplus & metabolic acceleration",
  },
];

export const DIET_PREFERENCES = [
  "Vegetarian (Dairy)",
  "Pure Vegetarian / Vegan",
  "Eggetarian",
  "Non-Vegetarian (Chicken, Fish & Eggs)",
  "Jain Vegetarian",
];

export const FITNESS_GOALS = NUTRITIONAL_TARGETS;
export const BUSINESS_CATEGORIES = NUTRITIONAL_TARGETS;

// ==========================================
// 6 NUTRITION PILLARS & 18 CLINICAL QUESTIONS (100 PTS)
// ==========================================

export const AUDIT_SECTIONS: AuditSection[] = [
  {
    id: "protein",
    name: "Daily Protein Density & Satiety",
    shortName: "Protein & Satiety",
    pillarNumber: 1,
    icon: "Utensils",
    maxPoints: 17,
    subtitle: "Protein density, meal distribution, and post-meal satiety duration.",
    questions: [
      {
        id: "p1_1",
        sectionId: "protein",
        numberStr: "1.1",
        text: "Where do you get your daily protein from?",
        description: "Assess the primary sources of protein across your regular daily diet.",
        options: [
          {
            text: "Mainly Dal, Roti & Milk Tea",
            hint: "Dal is 75% carb by weight. Net daily protein is severely below metabolic baseline.",
            badge: "<30g Daily Intake",
            points: 0,
          },
          {
            text: "Occasional Paneer / 1-2 Eggs",
            hint: "Eat eggs or paneer once every few days, but no consistent daily protein source.",
            badge: "40-55g Irregular",
            points: 3,
          },
          {
            text: "Structured Quality Protein Daily",
            hint: "Include measured paneer, tofu, soya, eggs, chicken, or whey protein consistently.",
            badge: "1.2g–1.6g / kg Optimal",
            points: 6,
          },
        ],
      },
      {
        id: "p1_2",
        sectionId: "protein",
        numberStr: "1.2",
        text: "Protein Distribution Across Your Meals",
        description: "How protein is distributed from breakfast through dinner.",
        options: [
          {
            text: "Zero Protein in Breakfast",
            hint: "Breakfast is strictly poha, upma, bread butter, or biscuits. Triggers morning glucose spike.",
            badge: "High Insulin Spike",
            points: 0,
          },
          {
            text: "Protein Only at Dinner",
            hint: "Breakfast and lunch are carb-heavy; only evening meal has paneer or chicken.",
            badge: "Unbalanced Fuel",
            points: 3,
          },
          {
            text: "25g+ Protein in 3 Meals",
            hint: "Every meal includes a solid protein anchor, stabilizing appetite and blood sugar.",
            badge: "Optimal Satiety",
            points: 6,
          },
        ],
      },
      {
        id: "p1_3",
        sectionId: "protein",
        numberStr: "1.3",
        text: "Satiety & Hunger Rebound (How soon are you hungry after eating?)",
        description: "How long you stay comfortably full after meals without urgent hunger.",
        options: [
          {
            text: "Hungry Again Within 90 Mins",
            hint: "Meals feel heavy while eating, but sudden cravings and hunger kick in soon after.",
            badge: "Reactive Hypoglycemia",
            points: 0,
          },
          {
            text: "Stays Full for 2–3 Hours",
            hint: "Moderate fullness, but feel the need to graze on rusks or roasted chana by 4 PM.",
            badge: "Short Satiety Window",
            points: 2,
          },
          {
            text: "Effortless 4–5 Hour Fullness",
            hint: "Zero food noise or urgent hunger between meals; sustained mental focus.",
            badge: "High Leptin Sensitivity",
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: "liquid_sugar",
    name: "Liquid Calories, Sugar & Hidden Calorie Leaks",
    shortName: "Sugar & Liquid Leaks",
    pillarNumber: 2,
    icon: "Coffee",
    maxPoints: 17,
    subtitle: "Chai/coffee frequency, sweet drinks, and refined evening tea snacks.",
    questions: [
      {
        id: "p2_1",
        sectionId: "liquid_sugar",
        numberStr: "2.1",
        text: "Daily Chai / Coffee with Milk & Sugar Intake",
        description: "Total volume of sweetened teas or coffees consumed throughout the day.",
        options: [
          {
            text: "3–5+ Cups Sweet Chai Daily",
            hint: "Full cream milk + 2 spoons sugar per cup. Adds 350–550 hidden liquid calories daily.",
            badge: "~15,000 Extra Kcal/Mo",
            points: 0,
          },
          {
            text: "1–2 Cups with Half Sugar",
            hint: "Moderate tea intake, but usually paired with 2–3 biscuits or rusks.",
            badge: "Moderate Calorie Leak",
            points: 3,
          },
          {
            text: "Black Coffee / Green Tea (No Sugar)",
            hint: "Zero liquid sugar; drink 3+ liters of plain water daily.",
            badge: "Zero Liquid Calories",
            points: 6,
          },
        ],
      },
      {
        id: "p2_2",
        sectionId: "liquid_sugar",
        numberStr: "2.2",
        text: "Packaged Juices, Cold Drinks, Shakes & \"Healthy\" Beverages",
        description: "Intake of fruit juices, smoothies, packaged beverages or sodas.",
        options: [
          {
            text: "Frequent Juices / Smoothies / Shakes",
            hint: "Belief that fresh juice is 'healthy' for fat loss. Fructose directly enters liver fat.",
            badge: "High Fructose Liver Load",
            points: 0,
          },
          {
            text: "Occasional Soda / Diet Drinks",
            hint: "Drink sweet drinks 1–2 times weekly during social outings.",
            badge: "Occasional Spike",
            points: 3,
          },
          {
            text: "Eat Whole Fruits Only",
            hint: "Never drink juice; eat whole apples/papaya with natural fiber intact.",
            badge: "Intact Fiber Matrix",
            points: 6,
          },
        ],
      },
      {
        id: "p2_3",
        sectionId: "liquid_sugar",
        numberStr: "2.3",
        text: "Evening 5 PM Namkeen, Biscuits, Bhujia & Fried Snacks",
        description: "Snacking habits during the notorious 4 PM - 6 PM tea window.",
        options: [
          {
            text: "Daily Namkeen / Biscuit Habit",
            hint: "Mindless handfuls of bhujia, mathri, or digestives. Refined palm oil + salt.",
            badge: "Refined Oil Drag",
            points: 0,
          },
          {
            text: "Roasted Makhana / Chana",
            hint: "Better food quality, but often overeat portions without realizing calorie density.",
            badge: "Portion Creep",
            points: 2,
          },
          {
            text: "Planned High-Protein Snack",
            hint: "Pre-portioned sprouts, boiled eggs, curd, or almonds; zero junk munching.",
            badge: "Clean Macro Control",
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: "weekend_social",
    name: "Weekend Damage & Social Eating",
    shortName: "Weekend & Social",
    pillarNumber: 3,
    icon: "Calendar",
    maxPoints: 17,
    subtitle: "Friday to Sunday eating patterns, restaurant dining, and post-weekend guilt.",
    questions: [
      {
        id: "p3_1",
        sectionId: "weekend_social",
        numberStr: "3.1",
        text: "The Friday Night to Sunday Evening Eating Pattern",
        description: "What happens to your nutrition discipline over the weekend.",
        options: [
          {
            text: "Complete Weekend Blowout",
            hint: "Strict Mon–Thu, but Swiggy/Zomato, pizza, sweets, and heavy dinners Friday through Sunday.",
            badge: "Wipes Mon–Thu Deficit",
            points: 0,
          },
          {
            text: "1–2 Social Meals with Family",
            hint: "Eat out on Saturday, but try to keep portions reasonable.",
            badge: "Moderate Calorie Drift",
            points: 3,
          },
          {
            text: "Conscious 7-Day Lifestyle",
            hint: "Maintain healthy choices when dining out; prioritize grilled proteins and salads.",
            badge: "Sustained Balance",
            points: 6,
          },
        ],
      },
      {
        id: "p3_2",
        sectionId: "weekend_social",
        numberStr: "3.2",
        text: "Alcohol, Mocktails & Restaurant Dining Out",
        description: "Alcohol frequency and heavy restaurant starters.",
        options: [
          {
            text: "Weekly Alcohol + Fried Starters",
            hint: "Beer/cocktails paired with nachos, tandoori tikka butter, and late-night carbs.",
            badge: "Blocks Fat Oxidation 48h",
            points: 0,
          },
          {
            text: "Occasional Drinks (1–2 Drinks/Month)",
            hint: "Rare social drinking; mostly stick to food when dining out.",
            badge: "Low Impact",
            points: 3,
          },
          {
            text: "Zero Alcohol / Clean Social Outings",
            hint: "Do not drink alcohol; choose fresh lemon water without sugar at events.",
            badge: "Clean Liver Clearance",
            points: 6,
          },
        ],
      },
      {
        id: "p3_3",
        sectionId: "weekend_social",
        numberStr: "3.3",
        text: "Monday Guilt, Skipping Meals & Crash Detoxes",
        description: "Your behavioral response on Monday morning following social weekends.",
        options: [
          {
            text: "Starve–Binge–Guilt Cycle",
            hint: "Feel guilty on Monday morning, skip meals or drink green juice all day, binge by night.",
            badge: "Metabolic Slowdown",
            points: 0,
          },
          {
            text: "Mild Guilt, Try to \"Eat Light\"",
            hint: "Notice puffiness and water weight on Monday, but resume normal food by Tuesday.",
            badge: "Water Weight Fluctuation",
            points: 2,
          },
          {
            text: "Steady, Calibrated Weekly Routine",
            hint: "Zero crash dieting or skipping; maintain steady metabolic fuel 365 days a year.",
            badge: "Unbreakable Consistency",
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: "gut_digestion",
    name: "Gut Health, Digestion & Bloating",
    shortName: "Gut & Digestion",
    pillarNumber: 4,
    icon: "ShieldAlert",
    maxPoints: 17,
    subtitle: "Post-meal bloating, bowel regularity, and dietary fiber/probiotic intake.",
    questions: [
      {
        id: "p4_1",
        sectionId: "gut_digestion",
        numberStr: "4.1",
        text: "Post-Meal Bloating, Gas & Acid Reflux / Heartburn",
        description: "Presence of abdominal distension, gas, or acidity after regular meals.",
        options: [
          {
            text: "Severe Daily Bloat & Acidity",
            hint: "Stomach distends like a balloon after lunch/dinner; need antacids (Pantaloc/Digene).",
            badge: "Gut Dysbiosis Flag",
            points: 0,
          },
          {
            text: "Bloating After Specific Foods",
            hint: "Get bloated after raw salads, kidney beans (rajma/chole), or excess wheat/gluten.",
            badge: "Food Sensitivity",
            points: 3,
          },
          {
            text: "Flat Stomach & Zero Discomfort",
            hint: "Smooth, quiet digestion with zero heartburn or painful stomach tightness.",
            badge: "Optimal Microbiome",
            points: 6,
          },
        ],
      },
      {
        id: "p4_2",
        sectionId: "gut_digestion",
        numberStr: "4.2",
        text: "Morning Bowel Movement Regularity & Elimination",
        description: "Ease and frequency of daily natural morning bowel movements.",
        options: [
          {
            text: "Chronic Constipation / Sluggish",
            hint: "Skip days without bowel movements or feel incomplete evacuation. Needs warm water/churna.",
            badge: "Toxin Reabsorption Risk",
            points: 0,
          },
          {
            text: "Irregular Depending on Travel/Stress",
            hint: "Mostly okay, but any change in schedule or work stress causes 2-day constipation.",
            badge: "Stress-Linked Bowel",
            points: 3,
          },
          {
            text: "Effortless Daily Morning Clearance",
            hint: "Natural, complete elimination every morning within 30 minutes of waking up.",
            badge: "Clean Colon Clearance",
            points: 6,
          },
        ],
      },
      {
        id: "p4_3",
        sectionId: "gut_digestion",
        numberStr: "4.3",
        text: "Dietary Fiber, Fermented Foods & Water Intake",
        description: "Intake of raw salads, soluble fiber, homemade curd, and water.",
        options: [
          {
            text: "<1.5L Water & Zero Raw Salads",
            hint: "Hardly drink water; meals are purely refined cooked gravies without raw fiber or curd.",
            badge: "Fiber Starvation",
            points: 0,
          },
          {
            text: "2L Water & Occasional Cucumber/Curd",
            hint: "Eat cucumber or curd sometimes, but inconsistent with daily soluble fiber.",
            badge: "Marginal Fiber",
            points: 2,
          },
          {
            text: "30g+ Fiber & Homemade Probiotics",
            hint: "Daily raw vegetables, chia seeds, homemade curd/buttermilk, and 3L water.",
            badge: "Robust Microbiome",
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: "cravings_stress",
    name: "Night Cravings, Stress & Cortisol Eating",
    shortName: "Cravings & Stress",
    pillarNumber: 5,
    icon: "Moon",
    maxPoints: 16,
    subtitle: "Post-dinner sweets, stress comfort eating, and late-night screen munching.",
    questions: [
      {
        id: "p5_1",
        sectionId: "cravings_stress",
        numberStr: "5.1",
        text: "Post-Dinner \"Meetha\" (Sweet) Cravings",
        description: "Urge to consume sweets, chocolate, ice cream or jaggery right after dinner.",
        options: [
          {
            text: "Daily Compulsory Sweet Craving",
            hint: "Cannot sleep without chocolate, mithai, ice cream, or jaggery (gud) right after dinner.",
            badge: "Dopamine / Serotonin Loop",
            points: 0,
          },
          {
            text: "Occasional Craving (2–3 Days/Wk)",
            hint: "Control it on weekdays, but crave a piece of dark chocolate or sweet treat when tired.",
            badge: "Fatigue Induced",
            points: 3,
          },
          {
            text: "Zero Cravings After Dinner",
            hint: "Balanced meals completely eliminate the urge to search the kitchen for sugar.",
            badge: "Stable Blood Sugar",
            points: 6,
          },
        ],
      },
      {
        id: "p5_2",
        sectionId: "cravings_stress",
        numberStr: "5.2",
        text: "Stress, Anxiety & Emotional Comfort Eating",
        description: "Tendency to reach for crunchy or sugary comfort snacks when stressed.",
        options: [
          {
            text: "Food is My Primary Stress Relief",
            hint: "When anxious, bored, or stressed from work/family, I immediately look for crunchy or sugary food.",
            badge: "High Cortisol Drive",
            points: 0,
          },
          {
            text: "Stress Snack Only on Heavy Workdays",
            hint: "Normally disciplined, but long working nights break my willpower.",
            badge: "Situational Stress",
            points: 2,
          },
          {
            text: "Mindful & Conscious Eating",
            hint: "Eat purely for bodily nourishment; manage stress with walking, breathing, or sleep.",
            badge: "Autonomous Discipline",
            points: 5,
          },
        ],
      },
      {
        id: "p5_3",
        sectionId: "cravings_stress",
        numberStr: "5.3",
        text: "Late Night 11 PM+ Screen Grazing",
        description: "Snacking while streaming shows or scrolling on phone late at night.",
        options: [
          {
            text: "Binge While Watching TV / OTT",
            hint: "Eating chips, popcorn, or sweets in bed while watching Netflix or scrolling Instagram.",
            badge: "Nocturnal Insulin Spike",
            points: 0,
          },
          {
            text: "Occasional Warm Milk / Fox Nuts",
            hint: "Have a light snack before bed when dinner was eaten too early at 7 PM.",
            badge: "Early Dinner Gap",
            points: 2,
          },
          {
            text: "Kitchen Closed After 8:30 PM",
            hint: "Maintain an effortless 12-hour overnight digestive rest window.",
            badge: "12h Fasting Window",
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: "hormonal_energy",
    name: "Hormonal, Energy & Blood Health",
    shortName: "Hormones & Energy",
    pillarNumber: 6,
    icon: "HeartPulse",
    maxPoints: 16,
    subtitle: "Clinical blood markers, post-lunch fatigue crashes, and past crash dieting rebound.",
    questions: [
      {
        id: "p6_1",
        sectionId: "hormonal_energy",
        numberStr: "6.1",
        text: "Diagnosed Hormonal / Metabolic Markers",
        description: "Diagnosed conditions impacting metabolism (Thyroid, PCOS, Fatty Liver, HbA1c).",
        options: [
          {
            text: "Thyroid / PCOS / Pre-Diabetes / Fatty Liver",
            hint: "Diagnosed clinical condition making fat loss impossible without a therapeutic nutrition plan.",
            badge: "Clinical Therapeutic Need",
            points: 0,
          },
          {
            text: "Borderline Cholesterol / High Uric Acid",
            hint: "Mildly elevated lipids or uric acid from sedentary desk work and diet leaks.",
            badge: "Metabolic Warning",
            points: 3,
          },
          {
            text: "All Blood Tests Completely Normal",
            hint: "Normal HbA1c (<5.6), balanced thyroid hormones, and clean ultrasound.",
            badge: "Optimal Biomarkers",
            points: 6,
          },
        ],
      },
      {
        id: "p6_2",
        sectionId: "hormonal_energy",
        numberStr: "6.2",
        text: "Daytime Fatigue, Lethargy & 3 PM Energy Crash",
        description: "Afternoon sluggishness, heavy post-lunch eyelids, or brain fog.",
        options: [
          {
            text: "Heavy Post-Lunch Sleepiness",
            hint: "Eyes feel heavy at desk; severe sluggishness proves insulin resistance and carb overload.",
            badge: "Glucose Spike Crash",
            points: 0,
          },
          {
            text: "Mild After-Lunch Slump",
            hint: "A bit sluggish after roti/rice meals, but recover after a walk or glass of water.",
            badge: "Moderate Drag",
            points: 2,
          },
          {
            text: "High Sustained Energy All Day",
            hint: "Sharp, active, and productive from morning until evening without caffeine dependency.",
            badge: "Metabolic Flexibility",
            points: 5,
          },
        ],
      },
      {
        id: "p6_3",
        sectionId: "hormonal_energy",
        numberStr: "6.3",
        text: "Past Crash Dieting & Weight Rebound History",
        description: "History of soup/salad diets, severe calorie deprivation, or stubborn weight plateaus.",
        options: [
          {
            text: "Lost Weight on Crash Diet, Gained Double Back",
            hint: "Starved on soups/salads or keto in past; metabolism slowed down, body rebounded heavier.",
            badge: "Damaged Metabolic Rate",
            points: 0,
          },
          {
            text: "Stuck at Same Weight for 6+ Months",
            hint: "Eating less and exercising, but weight scale won't budge. Hitting a chronic plateau.",
            badge: "Adaptation Plateau",
            points: 2,
          },
          {
            text: "First Time Starting a Clinical Diet",
            hint: "Never damaged metabolism with crash diets; clean slate ready for metabolic coaching.",
            badge: "Responsive Metabolism",
            points: 5,
          },
        ],
      },
    ],
  },
];

// ==========================================
// SCORING BANDS & CLINICAL PROTOCOLS
// ==========================================

export interface SectionScore {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface ScoreBand {
  title: string;
  range: string;
  badgeClass: string;
  accentColor: string;
  headline: string;
  description: string;
  sprintRecommendation: string;
  sprintDetails: string;
}

export interface AuditRecord {
  id: string;
  createdAt: string;
  business: ClientDetails;
  answers: Record<string, number>;
  sectionScores: SectionScore[];
  totalScore: number;
  maxScore: number;
  percentage?: number;
  band: ScoreBand;
  findings: Array<{
    questionText: string;
    chosenOptionText: string;
    pointsAwarded: number;
    maxPoints: number;
    sectionName: string;
    hint?: string;
    badge?: string;
  }>;
  diagnosis?: {
    headline: string;
    laggingPillars: string[];
    diagnosisText: string;
  };
}

export function getScoreBand(score: number): ScoreBand {
  if (score < 40) {
    return {
      title: "Severe Deficit / Metabolic Drag",
      range: "0–39",
      badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      accentColor: "#EF4444",
      headline: "High Visceral Drag & Chronic Metabolic Slowdown",
      description:
        "Your clinical baseline indicates severe daily protein deficit, hidden liquid calorie accumulation, gut dysbiosis, and high cortisol snacking. Traditional low-calorie crash dieting will further damage your basal metabolic rate; a structured clinical nutrition reset is urgently required.",
      sprintRecommendation: "12-Week Clinical Metabolic & Gut Reset Protocol",
      sprintDetails:
        "Dedicated Clinical Nutritionist, anti-inflammatory meal templates, daily photo food logging, therapeutic protein calibration (1.2–1.5g/kg), and bi-weekly body composition scans.",
    };
  }
  if (score < 70) {
    return {
      title: "Moderate Deficit / Macro Inconsistency",
      range: "40–69",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      accentColor: "#F59E0B",
      headline: "Good Intentions With Major Hidden Calorie & Protein Gaps",
      description:
        "You maintain good health consciousness, but uneven protein distribution, evening tea snacking creep, and weekend calorie blowouts are neutralizing your weekly deficit.",
      sprintRecommendation: "Rethink 8-Week Visceral Belly & Fat Loss Accelerator",
      sprintDetails:
        "Glycemic stabilization roadmap, high-satiety protein anchoring across all 3 meals, weekend social dining protocol, and daily WhatsApp accountability.",
    };
  }
  if (score < 90) {
    return {
      title: "Disciplined / Needs Metabolic Tuning",
      range: "70–89",
      badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      accentColor: "#0EA5E9",
      headline: "Strong Baseline Ready for Precision Micronutrient Scaling",
      description:
        "Consistently clean nutritional choices with strong satiety control. Fine-tuning gut microbiome diversity, circadian fasting timing, and hormonal balancing will unlock stubborn belly fat.",
      sprintRecommendation: "Rethink Precision Metabolic & Hormone Coaching",
      sprintDetails:
        "Nutrient timing optimization, gut prebiotic diversity protocol, continuous glucose stability, and body recomposition.",
    };
  }
  return {
    title: "Peak Metabolic Health & Gut Resilience",
    range: "90–100",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    accentColor: "#10B981",
    headline: "Elite Nutritional Discipline & High Leptin Sensitivity",
    description:
      "Outstanding consistency across all 6 nutritional pillars. Quiet effortless satiety, flat bloat-free digestion, zero sugar reliance, and resilient metabolic flexibility.",
    sprintRecommendation: "Rethink VIP Nutritional Retainer",
    sprintDetails:
      "Quarterly biomarker screening, seasonal nutrition adjustments, longevity protocols, and intuitive lifestyle sustainability.",
  };
}

export function getImprovementVectors(sectionScores: SectionScore[]): {
  headline: string;
  laggingPillars: string[];
  diagnosisText: string;
} {
  const sorted = [...sectionScores].sort((a, b) => a.score - b.score);
  const lowest = sorted.filter((s) => s.percentage < 65);

  if (lowest.length === 0) {
    return {
      headline: "All 6 Nutritional Pillars Balanced",
      laggingPillars: ["Peak Metabolic Maintenance"],
      diagnosisText:
        "Your clinical nutritional baseline is exceptionally balanced. Focus on sustaining mindful nourishment and seasonal dietary diversity.",
    };
  }

  const laggingPillars = lowest.map((l) => l.name);
  const headline = laggingPillars.slice(0, 3).join(" & ");

  return {
    headline,
    laggingPillars,
    diagnosisText:
      "Your intake reveals significant metabolic drag caused by protein deficits, liquid calorie spikes, or digestive inflammation. Structured clinical coaching will reset your metabolism.",
  };
}

export function calculateAudit(
  business: ClientDetails,
  answers: Record<string, number>,
  auditId?: string
): AuditRecord {
  // Sync live BMI & protein need into business
  if (business.heightCm && business.weightKg) {
    const bmiRes = calculateBmi(business.heightCm, business.weightKg, business.targetWeightKg);
    if (bmiRes) {
      business.bmi = bmiRes.formattedBmi;
      business.bmiCategory = bmiRes.category;
      business.optimalMinKg = bmiRes.optimalMinKg.toString();
      business.optimalMaxKg = bmiRes.optimalMaxKg.toString();
      business.weightGapKg = bmiRes.weightGapText;
      business.proteinNeedMin = bmiRes.proteinNeedMin.toString();
      business.proteinNeedMax = bmiRes.proteinNeedMax.toString();
    }
  }

  const sectionScores: SectionScore[] = AUDIT_SECTIONS.map((section) => {
    let score = 0;
    section.questions.forEach((q) => {
      const chosenIdx = answers[q.id];
      if (chosenIdx !== undefined && q.options[chosenIdx]) {
        score += q.options[chosenIdx].points;
      }
    });
    return {
      id: section.id,
      name: section.name,
      shortName: section.shortName,
      icon: section.icon,
      score,
      maxScore: section.maxPoints,
      percentage: Math.round((score / section.maxPoints) * 100),
    };
  });

  const totalScore = sectionScores.reduce((sum, s) => sum + s.score, 0);
  const band = getScoreBand(totalScore);
  const diagnosis = getImprovementVectors(sectionScores);

  const findings: AuditRecord["findings"] = [];
  AUDIT_SECTIONS.forEach((section) => {
    section.questions.forEach((q) => {
      const chosenIdx = answers[q.id];
      const opt = chosenIdx !== undefined ? q.options[chosenIdx] : null;
      findings.push({
        questionText: q.text,
        chosenOptionText: opt ? opt.text : "Not answered",
        pointsAwarded: opt ? opt.points : 0,
        maxPoints: Math.max(...q.options.map((o) => o.points)),
        sectionName: section.name,
        hint: opt?.hint,
        badge: opt?.badge,
      });
    });
  });

  const finalId =
    auditId ||
    `RN-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    id: finalId,
    createdAt: new Date().toISOString(),
    business,
    answers,
    sectionScores,
    totalScore,
    maxScore: 100,
    percentage: totalScore,
    band,
    findings,
    diagnosis,
  };
}

// ==========================================
// SAMPLE CLIENT: PRIYA SHARMA
// ==========================================

export const SAMPLE_AUDIT: AuditRecord = {
  id: "RN-261119-4820",
  createdAt: "2026-11-19T10:30:00.000Z",
  business: {
    name: "Priya Sharma",
    clientName: "Priya Sharma",
    phone: "+91 98765 43210",
    whatsappNumber: "9876543210",
    age: "34",
    biologicalSex: "Female",
    category: "Drop Visceral Belly Fat & Lose 8-12 kg",
    dietPreference: "Vegetarian (Dairy)",
    locality: "34 yrs • Female • Vegetarian (Dairy)",
    heightCm: "162",
    heightUnit: "cm",
    weightKg: "76",
    targetWeightKg: "60",
    bmi: "29.0",
    bmiCategory: "Overweight",
    optimalMinKg: "49",
    optimalMaxKg: "65",
    weightGapKg: "-16.0 kg",
    proteinNeedMin: "91",
    proteinNeedMax: "114",
    auditorName: "Rethink Clinical Nutritionist",
    goal: "Drop Visceral Belly Fat & Lose 8-12 kg",
  },
  answers: {
    // Pillar 1: Protein & Satiety
    p1_1: 0, // Mainly Dal, Roti & Milk Tea (0 pts)
    p1_2: 0, // Zero Protein in Breakfast (0 pts)
    p1_3: 0, // Hungry Again Within 90 Mins (0 pts) -> 0/17

    // Pillar 2: Liquid Calories & Sugar
    p2_1: 0, // 3-5+ Cups Sweet Chai Daily (0 pts)
    p2_2: 1, // Occasional Soda / Diet Drinks (3 pts)
    p2_3: 0, // Daily Namkeen / Biscuit Habit (0 pts) -> 3/17

    // Pillar 3: Weekend Damage
    p3_1: 0, // Complete Weekend Blowout (0 pts)
    p3_2: 2, // Zero Alcohol / Clean Social Outings (6 pts)
    p3_3: 0, // Starve–Binge–Guilt Cycle (0 pts) -> 6/17

    // Pillar 4: Gut Health & Digestion
    p4_1: 0, // Severe Daily Bloat & Acidity (0 pts)
    p4_2: 1, // Irregular Depending on Travel/Stress (3 pts)
    p4_3: 1, // 2L Water & Occasional Cucumber/Curd (2 pts) -> 5/17

    // Pillar 5: Cravings & Stress
    p5_1: 0, // Daily Compulsory Sweet Craving (0 pts)
    p5_2: 0, // Food is My Primary Stress Relief (0 pts)
    p5_3: 1, // Occasional Warm Milk / Fox Nuts (2 pts) -> 2/16

    // Pillar 6: Hormonal, Energy & Blood Health
    p6_1: 1, // Borderline Cholesterol / High Uric Acid (3 pts)
    p6_2: 0, // Heavy Post-Lunch Sleepiness (0 pts)
    p6_3: 0, // Lost Weight on Crash Diet, Gained Double Back (0 pts) -> 3/16
  },
  sectionScores: [
    { id: "protein", name: "Daily Protein Density & Satiety", shortName: "Protein & Satiety", icon: "Utensils", score: 0, maxScore: 17, percentage: 0 },
    { id: "liquid_sugar", name: "Liquid Calories, Sugar & Hidden Calorie Leaks", shortName: "Sugar & Liquid Leaks", icon: "Coffee", score: 3, maxScore: 17, percentage: 18 },
    { id: "weekend_social", name: "Weekend Damage & Social Eating", shortName: "Weekend & Social", icon: "Calendar", score: 6, maxScore: 17, percentage: 35 },
    { id: "gut_digestion", name: "Gut Health, Digestion & Bloating", shortName: "Gut & Digestion", icon: "ShieldAlert", score: 5, maxScore: 17, percentage: 29 },
    { id: "cravings_stress", name: "Night Cravings, Stress & Cortisol Eating", shortName: "Cravings & Stress", icon: "Moon", score: 2, maxScore: 16, percentage: 13 },
    { id: "hormonal_energy", name: "Hormonal, Energy & Blood Health", shortName: "Hormones & Energy", icon: "HeartPulse", score: 3, maxScore: 16, percentage: 19 },
  ],
  totalScore: 19,
  maxScore: 100,
  percentage: 19,
  band: getScoreBand(19),
  findings: [],
  diagnosis: {
    headline: "Daily Protein Density & Night Cravings & Liquid Calories",
    laggingPillars: [
      "Daily Protein Density & Satiety",
      "Night Cravings, Stress & Cortisol Eating",
      "Liquid Calories, Sugar & Hidden Calorie Leaks",
    ],
    diagnosisText:
      "Your intake reveals significant metabolic drag caused by protein deficits, liquid calorie spikes, or digestive inflammation. Structured clinical coaching will reset your metabolism.",
  },
};
