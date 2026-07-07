import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    // 1. Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const mode = searchParams.get('mode'); 

    // 2. Build the MongoDB query dynamically
    let query: any = {};

    // If there's a search term, look for it in the event name (case-insensitive)
    if (search) {
      query.name = { $regex: search, $options: 'i' }; 
    }
    
    // Exact match for category (e.g., 'Workshop')
    if (category) {
      query.category = category;
    }
    
    // Exact match for location/mode (e.g., 'Online')
    if (mode) {
      query.location = mode;
    }

    // 3. Fetch from database and sort by date (closest first)
    const events = await Event.find(query).sort({ date: 1 });

    return NextResponse.json({ success: true, count: events.length, data: events });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch events",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}