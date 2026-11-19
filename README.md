# Rethink Nutrition Audit

A clinical nutrition diagnostic, scoring, and client-intake platform built for **Rethink Nutritionists & Dietitians** to assess dietary habits, calculate health biometrics (BMI, target weight gap), run 360° nutritional audits, and generate personalized nutrition performance reports.

---

## 🔗 Repository

- **GitHub Repository**: [https://github.com/connecttws/Rethink-Nutrition-Audit](https://github.com/connecttws/Rethink-Nutrition-Audit)

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Database & ORM**: [Prisma 6](https://www.prisma.io/) with PostgreSQL / Supabase
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🥗 Clinical Assessment Pillars

The diagnostic engine evaluates client nutrition across 6 core physiological pillars:

1. **Macronutrient Balance & Protein Sufficiency**: Protein distribution per meal, healthy fats ratio, and complex vs. refined carbohydrate consumption.
2. **Micronutrient Density & Plant Diversity**: Daily intake of colors, leafy greens, seed cycling, and essential vitamin/mineral sources.
3. **Gut Microbiome & Digestive Vitality**: Bowel consistency, bloat triggers, fermented foods, fiber sufficiency, and elimination frequency.
4. **Circadian Rhythm & Meal Chronobiology**: Fasting windows, eating past sunset, breakfast timing, and insulin spike mitigation.
5. **Hydration & Cellular Electrolytes**: Fluid volume, mineral replenishment, caffeine/alcohol offset, and water intake timing.
6. **Inflammation Triggers & Metabolic Habits**: Seed oils, artificial sweeteners, refined sugar frequency, ultra-processed food reliance, and stress-eating patterns.

---

## ✨ Key Features

1. **Client Intake & Nutritional Biometrics**:
   - Captures client details, dietary preferences (Vegetarian, Vegan, Non-Veg, Eggetarian), primary nutritional targets, age, and biological sex.
   - Dynamic height (cm / ft+in) and weight inputs with automatic BMI, BMI category, and optimal target weight gap computation.

2. **Dual Questionnaire Experience**:
   - **Continuous Flow**: Rapid questionnaire experience ideal for field assessments and quick consultations.
   - **Stepped Pillar Flow**: Deep-dive clinical intake with guided question-by-question scoring and badge highlights.

3. **Executive Client Report (`/report` & `/r/[id]`)**:
   - Comprehensive nutrition diagnostic report featuring score gauges, prioritized dietary findings, and personalized nutritional action plans.
   - Public shareable link routing (`/r/[id]`) with direct WhatsApp sharing integration.

4. **Database & Storage Architecture**:
   - PostgreSQL persistence with Prisma ORM (`Audit` model with structured JSON metrics and custom recommendations).
   - Offline / local fallback storage support for clinic or field assessments.

---

## 📁 Directory Structure

```
Rethink-Nutrition-Audit/
├── prisma/
│   ├── schema.prisma                         # Prisma schema definition
│   └── create_rethink_nutrition_audits.sql   # SQL migration / DDL script
├── public/                                   # Static icons and assets
├── scripts/
│   ├── init-db.mjs                           # Database initialization helper
│   └── test-db.mjs                           # Database connectivity tester
├── src/
│   ├── app/
│   │   ├── api/audits/                       # CRUD API routes for audit submissions
│   │   ├── r/[id]/                           # Shareable public report route
│   │   ├── report/                           # Executive report rendering page
│   │   ├── globals.css                       # Tailwind v4 styles & theme configuration
│   │   ├── layout.tsx                        # Root application layout
│   │   └── page.tsx                          # Main intake wizard & questionnaire
│   ├── components/
│   │   ├── BusinessInfoStep.tsx              # Client intake form & biometric calculator
│   │   ├── CategoryStep.tsx                  # Dietary target selection step
│   │   ├── ContinuousQuestionnaire.tsx       # Continuous questionnaire flow
│   │   ├── QuestionStepperStep.tsx           # Stepped pillar assessment flow
│   │   ├── RecentAuditsModal.tsx             # Recent audits browser modal
│   │   └── report/                           # Report components (Cover, Breakdown, Findings, CTA)
│   └── lib/
│       ├── audit-data.ts                     # Nutritional questions, pillars & scoring logic
│       ├── audit-storage.ts                  # Client/server persistence helpers
│       └── prisma.ts                         # Prisma client singleton
├── .env.example                              # Database URL & environment configuration
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/connecttws/Rethink-Nutrition-Audit.git
cd Rethink-Nutrition-Audit
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and set your PostgreSQL / Supabase connection string:
```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

### 3. Setup Database
Generate the Prisma Client and sync your schema:
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start a nutrition assessment.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📄 License

All rights reserved © Rethink Nutrition / TWS. Built for professional clinical nutrition diagnostics.
