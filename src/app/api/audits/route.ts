import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAudit, ClientDetails } from "@/lib/audit-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business, answers } = body as {
      business: ClientDetails;
      answers: Record<string, number>;
    };

    if (!business?.name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Client name is required" },
        { status: 400 }
      );
    }

    // Compute complete scores & findings
    const calculated = calculateAudit(business, answers || {});

    const localitySummary =
      calculated.business.locality?.trim() ||
      `${calculated.business.age || "34"} yrs • ${calculated.business.biologicalSex || "Female"} • ${calculated.business.dietPreference || "Vegetarian (Dairy)"}`;

    // Save to database
    const saved = await (prisma as any).rethinkNutriAudit.create({
      data: {
        businessName: calculated.business.name.trim(),
        clientName: calculated.business.clientName?.trim() || calculated.business.name.trim(),
        slug: calculated.id || null,
        category: calculated.business.category || "Drop Visceral Belly Fat & Lose 8-12 kg",
        locality: localitySummary,
        phone: calculated.business.phone || null,
        whatsappNumber: calculated.business.whatsappNumber || calculated.business.phone || null,
        mapsUrl: calculated.business.mapsUrl || null,
        auditorName: calculated.business.auditorName || "Rethink Nutritionist",

        age: calculated.business.age || null,
        height: calculated.business.heightCm || null,
        weight: calculated.business.weightKg || null,
        bmi: calculated.business.bmi || null,
        bmiCategory: calculated.business.bmiCategory || null,
        primaryGoal: calculated.business.category || null,
        biometrics: {
          age: calculated.business.age,
          biologicalSex: calculated.business.biologicalSex,
          dietPreference: calculated.business.dietPreference,
          heightCm: calculated.business.heightCm,
          heightFt: calculated.business.heightFt,
          heightIn: calculated.business.heightIn,
          heightUnit: calculated.business.heightUnit,
          weightKg: calculated.business.weightKg,
          targetWeightKg: calculated.business.targetWeightKg,
          bmi: calculated.business.bmi,
          bmiCategory: calculated.business.bmiCategory,
          optimalMinKg: calculated.business.optimalMinKg,
          optimalMaxKg: calculated.business.optimalMaxKg,
          weightGapKg: calculated.business.weightGapKg,
          proteinNeedMin: calculated.business.proteinNeedMin,
          proteinNeedMax: calculated.business.proteinNeedMax,
        },

        totalScore: calculated.totalScore,
        maxScore: calculated.maxScore,
        percentage: Math.round((calculated.totalScore / calculated.maxScore) * 100),
        bandTitle: calculated.band.title,
        bandRange: calculated.band.range,
        bandHeadline: calculated.band.headline,
        bandDescription: calculated.band.description,
        sprintRecommendation: calculated.band.sprintRecommendation,
        sprintDetails: calculated.band.sprintDetails,

        mapsScore: calculated.sectionScores.find((s) => s.id === "protein")?.score ?? 0,
        visualsScore: calculated.sectionScores.find((s) => s.id === "liquid_sugar")?.score ?? 0,
        webScore: calculated.sectionScores.find((s) => s.id === "weekend_social")?.score ?? 0,
        adsScore: calculated.sectionScores.find((s) => s.id === "gut_digestion")?.score ?? 0,
        speedScore: calculated.sectionScores.find((s) => s.id === "cravings_stress")?.score ?? 0,

        sectionScores: calculated.sectionScores as any,
        answers: calculated.answers as any,
        findings: calculated.findings as any,
      },
    });

    const shortUrl = `/r/${saved.id}`;
    const fullUrl = `/report?id=${saved.id}`;
    const token = Buffer.from(`${saved.id}:${saved.createdAt.getTime()}`).toString("base64");

    return NextResponse.json(
      {
        success: true,
        audit: {
          ...calculated,
          id: saved.id,
          createdAt: saved.createdAt.toISOString(),
        },
        id: saved.id,
        shortUrl,
        fullUrl,
        token,
      },
      {
        headers: {
          "X-Audit-ID": saved.id,
          "X-Audit-Short-URL": shortUrl,
          "X-Audit-Token": token,
        },
      }
    );
  } catch (error: any) {
    console.error("Error creating nutrition audit record:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to save nutrition audit record to database",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "5", 10), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const where: any = {};
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: "insensitive" } },
        { locality: { contains: search, mode: "insensitive" } },
        { whatsappNumber: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) {
      where.category = category;
    }

    const [totalCount, records] = await Promise.all([
      (prisma as any).rethinkNutriAudit.count({ where }),
      (prisma as any).rethinkNutriAudit.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          businessName: true,
          category: true,
          locality: true,
          whatsappNumber: true,
          totalScore: true,
          bandTitle: true,
          createdAt: true,
          viewCount: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      audits: (records as any[]).map((r: any) => ({
        id: r.id,
        name: r.businessName,
        category: r.category,
        locality: r.locality,
        whatsappNumber: r.whatsappNumber,
        score: r.totalScore,
        bandTitle: r.bandTitle,
        date: r.createdAt.toISOString(),
        viewCount: r.viewCount,
      })),
      total: totalCount,
      hasMore: offset + records.length < totalCount,
    });
  } catch (error: any) {
    console.error("Error listing nutrition audits:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to list nutrition audits" },
      { status: 500 }
    );
  }
}
