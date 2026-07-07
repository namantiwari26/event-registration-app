import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  collegeOrCompany: string;
  source: 'LinkedIn' | 'WhatsApp' | 'Instagram' | 'Email' | 'Direct';
}

const RegistrationSchema: Schema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'] 
  },
  phone: { 
    type: String, 
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  collegeOrCompany: { type: String, required: true },
  source: { 
    type: String, 
    enum: ['LinkedIn', 'WhatsApp', 'Instagram', 'Email', 'Direct'], 
    required: true 
  }
}, { timestamps: true });

// Ensure the same email cannot register twice for the SAME event
RegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

export default mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema);