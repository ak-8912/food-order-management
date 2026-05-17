import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim();

    const menu = await prisma.menuItem.findMany({
      where: query
        ? {
            name: {
              contains: query,
            },
          }
        : undefined,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Failed to fetch menu", error);

    return NextResponse.json(
      { error: "Failed to fetch menu items." },
      { status: 500 }
    );
  }
}
