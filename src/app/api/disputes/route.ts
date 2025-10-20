import { NextRequest, NextResponse } from 'next/server';
import { createDisputeSchema, disputeQuerySchema } from '@/lib/validations/dispute';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = {
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      priority: searchParams.get('priority') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedQuery = disputeQuerySchema.parse(queryParams);
    const { page, limit, sortBy, sortOrder, ...filters } = validatedQuery;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.priority) where.priority = filters.priority;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch disputes with relations
    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: {
          documents: true,
          timeline: {
            orderBy: { createdAt: 'desc' },
            take: 5, // Limit timeline events for list view
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.dispute.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: disputes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Disputes API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch disputes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validatedData = createDisputeSchema.parse(body);
    
    // Get or create test user for API testing
    let testUser = await prisma.user.findFirst({
      where: { telegramUsername: 'api_test_user' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          telegramId: BigInt(999999999),
          telegramUsername: 'api_test_user',
          firstName: 'API',
          lastName: 'Test',
          phone: '+79999999999',
          email: 'api@test.com',
        },
      });
    }

    // Create dispute with timeline event
    const dispute = await prisma.dispute.create({
      data: {
        ...validatedData,
        userId: testUser.id,
        timeline: {
          create: {
            type: 'CREATED',
            description: 'Спор создан',
            userId: testUser.id,
          },
        },
      },
      include: {
        documents: true,
        timeline: true,
      },
    });

    return NextResponse.json(dispute, { status: 201 });
  } catch (error) {
    console.error('Disputes API POST error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create dispute', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
