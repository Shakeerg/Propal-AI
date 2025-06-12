// models/User.ts
import mongoose from 'mongoose';
import { User as UserType, AgentConfiguration as AgentConfigurationType } from '@/app/types';

// Extend the UserType with Mongoose Document properties and the new agentConfig field
export interface UserDocument extends Omit<UserType, '_id'>, mongoose.Document { // ADD 'export' HERE
  agentConfig?: AgentConfigurationType; // Define agentConfig as an optional field
}

// Define the User Schema
const UserSchema = new mongoose.Schema<UserDocument>({
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
    trim: true,
    maxlength: [20, 'Username cannot be more than 20 characters.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'], // Basic email regex validation
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: [8, 'Password must be at least 8 characters.'],
    // IMPORTANT: In a real application, you should hash this password before saving.
  },
  phoneNumber: {
    type: String,
    trim: true,
    maxlength: [15, 'Phone number cannot be more than 15 characters.'],
    required: false, // Optional
  },
  agentConfig: {
    provider: { type: String, required: false },
    model: { type: String, required: false },
    language: { type: String, required: false },
    displayName: { type: String, required: false },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the Mongoose model. If the model already exists, use it; otherwise, create it.
export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);