/**
 * Workspaces API
 * GET /api/workspaces - List user's workspaces
 * POST /api/workspaces - Create new workspace
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, ensureUser } from "@/lib/billing/credit-system";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(userId);
    
    const workspaces = await prisma.workspace.findMany({
      where: { userId: user.id },
      include: {
        brandMemory: true,
        products: { take: 5, orderBy: { createdAt: "desc" } },
        campaigns: { take: 5, orderBy: { createdAt: "desc" } },
        _count: {
          select: {
            products: true,
            campaigns: true,
            learnings: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("[workspaces GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(userId);
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        userId: user.id,
        name,
        description,
        brandMemory: {
          create: {},
        },
      },
      include: {
        brandMemory: true,
      },
    });

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("[workspaces POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
