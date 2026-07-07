import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  date: Date;
  category: 'Workshop' | 'Seminar' | 'Hackathon' | 'Webinar';
  location: 'Noida' | 'Online' | 'Hybrid';
  shortDescription: string;
  fullDescription: string;
  availableSeats: number;
}

const EventSchema: Schema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  category: { 
    type: String, 
    enum: ['Workshop', 'Seminar', 'Hackathon', 'Webinar'], 
    required: true 
  },
  location: { 
    type: String, 
    enum: ['Noida', 'Online', 'Hybrid'], 
    required: true 
  },
  shortDescription: { type: String, required: true, maxlength: 150 },
  fullDescription: { type: String, required: true },
  availableSeats: { type: Number, required: true, min: 0 }
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);