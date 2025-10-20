import { NextRequest, NextResponse } from 'next/server';
import { timelineEventSchema } from '@/lib/validations/dispute';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if dispute exists
    const dispute = await prisma.dispute.findUnique({
      where: { id },
    });

    if (!dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    // Get timeline events
    const timeline = await prisma.timelineEvent.findMany({
      where: { disputeId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(timeline);
  } catch (error) {
    console.error('Timeline API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = timelineEventSchema.parse(body);
    
    // Check if dispute exists
    const dispute = await prisma.dispute.findUnique({
      where: { id },
    });

    if (!dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    // Create timeline event
    const timelineEvent = await prisma.timelineEvent.create({
      data: {
        disputeId: id,
        ...validatedData,
        userId: 'anonymous', // TODO: Get from auth context
      },
    });

    return NextResponse.json(timelineEvent, { status: 201 });
  } catch (error) {
    console.error('Timeline API POST error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create timeline event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
