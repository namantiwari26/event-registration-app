import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';

const sampleEvents = [
  {
    name: "GDG Cloud New Delhi HackFest",
    date: new Date("2026-08-15T10:00:00Z"),
    category: "Hackathon",
    location: "Noida",
    shortDescription: "A 24-hour cloud computing and generative AI hackathon.",
    fullDescription: "Join developers and engineers for an intensive 24-hour hackathon focused on Google Cloud and GenAI APIs. Bring your team, build innovative solutions, and win prizes.",
    availableSeats: 50,
  },
  {
    name: "DevOps & SRE Roadmap Seminar",
    date: new Date("2026-09-10T14:00:00Z"),
    category: "Seminar",
    location: "Online",
    shortDescription: "Master the transition from DevOps to Site Reliability Engineering.",
    fullDescription: "An in-depth seminar on system architecture, deployment pipelines, and reliability engineering. Perfect for those looking to scale their platforms.",
    availableSeats: 100,
  },
  {
    name: "Intro to AI Agents with Kiro",
    date: new Date("2026-07-20T11:00:00Z"),
    category: "Workshop",
    location: "Hybrid",
    shortDescription: "Learn to build agentic AI frameworks.",
    fullDescription: "Hands-on workshop covering Retrieval-Augmented Generation (RAG) pipelines and Model Context Protocol integration.",
    availableSeats: 30,
  },
  {
    name: "Advanced Data Structures & Algorithms",
    date: new Date("2026-08-05T16:00:00Z"),
    category: "Webinar",
    location: "Online",
    shortDescription: "Crack the coding interview with optimal algorithms.",
    fullDescription: "A deep dive into dynamic programming, graphs, and optimizing subarray problems for top-tier tech recruitment.",
    availableSeats: 200,
  },
  {
    name: "Web Vulnerability Scanning Setup",
    date: new Date("2026-09-22T13:00:00Z"),
    category: "Workshop",
    location: "Noida",
    shortDescription: "Build your own VULNHUB system architecture.",
    fullDescription: "Security focused workshop on identifying and patching web vulnerabilities using automated scanning platforms.",
    availableSeats: 25,
  },
  {
    name: "Meta PyTorch Hackathon",
    date: new Date("2026-10-12T09:00:00Z"),
    category: "Hackathon",
    location: "Hybrid",
    shortDescription: "Build scalable machine learning models.",
    fullDescription: "Compete with other developers to build the most efficient and scalable ML architectures using PyTorch.",
    availableSeats: 40,
  },
  {
    name: "Platform Engineering Basics",
    date: new Date("2026-07-25T15:00:00Z"),
    category: "Seminar",
    location: "Online",
    shortDescription: "Understand the core of platform engineering.",
    fullDescription: "Learn how platform engineering differs from DevOps and how to build internal developer platforms that scale.",
    availableSeats: 150,
  },
  {
    name: "Open Source Contribution Drive",
    date: new Date("2026-11-01T10:00:00Z"),
    category: "Workshop",
    location: "Online",
    shortDescription: "Make your first open source commit.",
    fullDescription: "A guided session on finding beginner-friendly projects on GitHub, understanding version control, and submitting pull requests.",
    availableSeats: 80,
  }
];

export async function GET() {
  try {
    await connectDB();
    
    // Clear out any existing data to prevent duplicates
    await Event.deleteMany({});
    
    // Insert the required 8 sample events
    await Event.insertMany(sampleEvents);
    
    return NextResponse.json({ 
      success: true, 
      message: "Database successfully seeded with 8 events!" 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "Failed to seed database", 
      error 
    }, { status: 500 });
  }
}