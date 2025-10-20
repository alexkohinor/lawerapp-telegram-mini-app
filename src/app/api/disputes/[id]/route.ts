import { NextRequest, NextResponse } from 'next/server';
import { updateDisputeSchema } from '@/lib/validations/dispute';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dispute);
  } catch (error) {
    console.error('Dispute API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dispute', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = updateDisputeSchema.parse(body);
    
    // Check if dispute exists
    const existingDispute = await prisma.dispute.findUnique({
      where: { id },
    });

    if (!existingDispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    // Update dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id },
      data: validatedData,
      include: {
        documents: true,
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Add timeline event for status changes
    if (validatedData.status && validatedData.status !== existingDispute.status) {
      await prisma.timelineEvent.create({
        data: {
          disputeId: id,
          type: 'STATUS_CHANGED',
          description: `Статус изменен с "${existingDispute.status}" на "${validatedData.status}"`,
          userId: 'anonymous', // TODO: Get from auth context
        },
      });
    }

    return NextResponse.json(updatedDispute);
  } catch (error) {
    console.error('Dispute API PUT error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update dispute', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if dispute exists
    const existingDispute = await prisma.dispute.findUnique({
      where: { id },
    });

    if (!existingDispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    // Soft delete by updating status to CLOSED
    await prisma.dispute.update({
      where: { id },
      data: { 
        status: 'CLOSED',
        resolvedAt: new Date(),
      },
    });

    // Add timeline event
    await prisma.timelineEvent.create({
      data: {
        disputeId: id,
        type: 'STATUS_CHANGED',
        description: 'Спор закрыт',
        userId: 'anonymous', // TODO: Get from auth context
      },
    });

    return NextResponse.json({ message: 'Dispute closed successfully' });
  } catch (error) {
    console.error('Dispute API DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete dispute', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
