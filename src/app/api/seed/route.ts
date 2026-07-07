import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Registration from '@/models/Registration';

const sampleEvents = [
  { 
    name: "GDG New Delhi HackFest", 
    date: new Date("2026-08-15T10:00:00Z"), 
    category: "Hackathon", 
    location: "Noida", 
    shortDescription: "A 24-hour cloud computing and GenAI hackathon.", 
    fullDescription: `Join us for an intensive 24-hour hackathon focused on Google Cloud and Generative AI APIs. Build innovative solutions and compete with top developers!

🕒 Time: 10:00 AM (Saturday) to 10:00 AM (Sunday)
📍 Venue: Galgotias University, Block C Auditorium
🎁 Perks: Free meals, exclusive Google Cloud swag kits, and cash prizes up to ₹50,000 for the winning team!

Requirements: Bring your laptop, charger, and a valid student ID.`, 
    availableSeats: 45 
  },
  { 
    name: "Intro to AI Agents with Kiro", 
    date: new Date("2026-07-20T11:00:00Z"), 
    category: "Workshop", 
    location: "Hybrid", 
    shortDescription: "Learn to build agentic AI frameworks.", 
    fullDescription: `A hands-on technical workshop covering Retrieval-Augmented Generation (RAG) pipelines and Model Context Protocol integration.

🕒 Time: 2:00 PM - 5:00 PM
📍 Venue: Online via Zoom & Room 302
📜 Certificate: Guaranteed Certificate of Participation
💻 Prerequisites: Basic knowledge of Python and API requests.`, 
    availableSeats: 29 
  },
  { 
    name: "DevOps & SRE Seminar", 
    date: new Date("2026-09-10T14:00:00Z"), 
    category: "Seminar", 
    location: "Online", 
    shortDescription: "Master SRE pipelines and system architecture.", 
    fullDescription: `An in-depth seminar on system architecture, deployment pipelines, and reliability engineering. Perfect for those looking to scale their platforms.

🕒 Time: 11:00 AM - 1:00 PM
📍 Venue: Google Meet (Link provided upon registration)
🎙️ Speaker: Senior Cloud Architect
💡 Focus: CI/CD Pipelines, Kubernetes scaling, and incident management.`, 
    availableSeats: 98 
  },
  { 
    name: "Advanced DSA Webinar", 
    date: new Date("2026-08-05T16:00:00Z"), 
    category: "Webinar", 
    location: "Online", 
    shortDescription: "Crack the coding interview with optimal algorithms.", 
    fullDescription: `A deep dive into dynamic programming, graphs, and optimizing subarray problems for top-tier tech recruitment.

🕒 Time: 4:00 PM - 6:00 PM
📍 Venue: Zoom Webinar
🎯 Target Audience: Pre-final and final year CSE students
📝 Takeaways: Interview cheat sheets and 10 exclusive mock problems.`, 
    availableSeats: 198 
  },
  { 
    name: "Web Vulnerability Workshop", 
    date: new Date("2026-09-22T13:00:00Z"), 
    category: "Workshop", 
    location: "Noida", 
    shortDescription: "Build your own VULNHUB system architecture.", 
    fullDescription: `Security-focused workshop on identifying and patching web vulnerabilities using automated scanning platforms.

🕒 Time: 1:00 PM - 5:00 PM
📍 Venue: Main Campus Cyber Lab
🛡️ Tech Stack: OWASP Top 10, Kali Linux, Burp Suite
⚠️ Note: Bring your own VM setup.`, 
    availableSeats: 24 
  },
  { 
    name: "Meta PyTorch Hackathon", 
    date: new Date("2026-10-12T09:00:00Z"), 
    category: "Hackathon", 
    location: "Hybrid", 
    shortDescription: "Build scalable machine learning models.", 
    fullDescription: `Compete with other developers to build the most efficient and scalable ML architectures using PyTorch.

🕒 Time: 48-Hour Sprint (Starts Friday 9:00 AM)
📍 Venue: Online / Regional Hubs
🏆 Grand Prize: Interview bypass for Meta AI Internships
🤖 Theme: Computer Vision and Large Language Models`, 
    availableSeats: 39 
  },
  { 
    name: "Platform Engineering Basics", 
    date: new Date("2026-07-25T15:00:00Z"), 
    category: "Seminar", 
    location: "Online", 
    shortDescription: "Understand the core of platform engineering.", 
    fullDescription: `Learn how platform engineering differs from traditional DevOps and how to build internal developer platforms (IDP) that scale seamlessly.

🕒 Time: 3:00 PM - 4:30 PM
📍 Venue: YouTube Live
📈 Perks: Live Q&A and architecture blueprint downloads.`, 
    availableSeats: 149 
  },
  { 
    name: "Open Source Contribution Drive", 
    date: new Date("2026-11-01T10:00:00Z"), 
    category: "Workshop", 
    location: "Online", 
    shortDescription: "Make your first open source commit on GitHub.", 
    fullDescription: `A guided session on finding beginner-friendly projects on GitHub, understanding version control, and submitting pull requests.

🕒 Time: 10:00 AM - 1:00 PM
📍 Venue: Discord Stage
💻 Goal: Everyone leaves with at least one merged PR!
🤝 Mentorship: 1-on-1 breakout rooms available.`, 
    availableSeats: 78 
  }
];

export async function GET() {
  try {
    await connectDB();
    
    // Clear out any existing data to prevent duplicates
    await Event.deleteMany({});
    await Registration.deleteMany({});
    
    // Insert the required 8 sample events
    const createdEvents = await Event.insertMany(sampleEvents);
    
    // Grab the ID of the first event to associate the mock users with
    const targetEventId = createdEvents[0]._id; 

    // Requirement 8: Explicitly injecting 10 sample user registrations
    const mockRegistrations = [
      { eventId: targetEventId, name: "Naman Tiwari", email: "naman@galgotias.edu", phone: "9876543210", collegeOrCompany: "Galgotias University", source: "Direct" },
      { eventId: targetEventId, name: "Aarav Sharma", email: "aarav.s@example.com", phone: "9876543211", collegeOrCompany: "Fidelity International", source: "LinkedIn" },
      { eventId: targetEventId, name: "Priya Patel", email: "priya.p@example.com", phone: "9876543212", collegeOrCompany: "Pinnacle Labs", source: "WhatsApp" },
      { eventId: targetEventId, name: "Rohan Kumar", email: "rohan.k@example.com", phone: "9876543213", collegeOrCompany: "Scaler School of Technology", source: "Instagram" },
      { eventId: targetEventId, name: "Ananya Gupta", email: "ananya.g@example.com", phone: "9876543214", collegeOrCompany: "Delhi University", source: "Email" },
      { eventId: targetEventId, name: "Vikram Singh", email: "vikram.s@example.com", phone: "9876543215", collegeOrCompany: "Tech Mahindra", source: "LinkedIn" },
      { eventId: targetEventId, name: "Neha Reddy", email: "neha.r@example.com", phone: "9876543216", collegeOrCompany: "Galgotias University", source: "WhatsApp" },
      { eventId: targetEventId, name: "Aditya Verma", email: "aditya.v@example.com", phone: "9876543217", collegeOrCompany: "TCS", source: "Direct" },
      { eventId: targetEventId, name: "Kavya Desai", email: "kavya.d@example.com", phone: "9876543218", collegeOrCompany: "Infosys", source: "Email" },
      { eventId: targetEventId, name: "Siddharth Jain", email: "sid.jain@example.com", phone: "9876543219", collegeOrCompany: "Wipro", source: "LinkedIn" }
    ];

    await Registration.insertMany(mockRegistrations);
    
    return NextResponse.json({ 
      success: true, 
      message: "Database successfully seeded with 8 rich events and 10 user registrations!" 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: "Failed to seed database", 
      error: error.message 
    }, { status: 500 });
  }
}