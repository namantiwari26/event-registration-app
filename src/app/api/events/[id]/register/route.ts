import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Registration from '@/models/Registration';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Unwrapping the params Promise explicitly
    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    
    const body = await request.json();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }
    if (event.availableSeats <= 0) {
      return NextResponse.json({ success: false, message: "Sorry, this event is completely sold out!" }, { status: 400 });
    }

    const existingRegistration = await Registration.findOne({ 
      eventId: eventId, 
      email: body.email 
    });
    
    if (existingRegistration) {
      return NextResponse.json({ success: false, message: "This email is already registered for this event." }, { status: 400 });
    }

    const newRegistration = await Registration.create({
      eventId: eventId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      collegeOrCompany: body.collegeOrCompany,
      source: body.source
    });

    event.availableSeats -= 1;
    await event.save();

    return NextResponse.json({ success: true, message: "Registration successful!", data: newRegistration }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Registration failed", error: error.message }, { status: 500 });
  }
}