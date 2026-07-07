import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Unwrapping the params Promise explicitly
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    if (!eventId || eventId.length !== 24) {
      return NextResponse.json({ success: false, message: "Invalid Event ID format" }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch event details", 
      error: error.message 
    }, { status: 500 });
  }
}