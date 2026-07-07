// src/app/api/events/[id]/registrations/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const registrations = await Registration.find({ eventId: id });
    return NextResponse.json({ success: true, count: registrations.length, data: registrations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}