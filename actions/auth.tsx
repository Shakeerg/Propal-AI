// actions/auth.ts

'use server';

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User'; // Mongoose Model
import type { UserDocument } from '@/models/User'; // UserDocument interface/type
import { User as UserType, AgentConfiguration as AgentConfigurationType } from '@/app/types';

// Define a type for a user document that only contains agentConfig and _id
interface AgentConfigUserDocument {
  _id: UserDocument['_id']; // Include _id as it's always returned by default
  agentConfig?: AgentConfigurationType; // agentConfig might be optional if not set
}

// Define a type for a user document that only contains specific profile fields and _id
interface UserProfileDocument {
  _id: UserDocument['_id'];
  username: UserDocument['username'];
  email: UserDocument['email'];
  phoneNumber?: UserDocument['phoneNumber']; // Use phoneNumber if that's the field name
  // Add other profile fields you select, excluding password
}

interface AuthResult {
  success: boolean;
  user?: string;
  error?: string;
  data?: UserType | AgentConfigurationType;
  message?: string; // Add message to AuthResult for success feedback
}

export async function registerUser(userData: UserType): Promise<AuthResult> {
  await dbConnect();
  try {
    const newUser = await User.create(userData);
    return { success: true, user: newUser.email };
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, error: 'Email or username already exists.' };
    }
    console.error('Server Action - Registration error:', error);
    return { success: false, error: 'Registration failed: ' + error.message };
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  await dbConnect();
  try {
    // Find the user document
    // We expect the full UserDocument here because we check the password
    const user = await User.findOne({ email }).lean<UserDocument>(); // .lean() here makes 'user' a plain object

    if (!user) { // Check if user was found
      return { success: false, error: 'Invalid email or password.' };
    }

    // Now 'user' is a plain JS object
    // IMPORTANT: For production, do NOT store plain passwords. Use bcrypt for hashing.
    if (user.password !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }
    return { success: true, user: user.email };
  } catch (error: any) {
    console.error('Server Action - Login error:', error);
    return { success: false, error: 'Login failed: ' + error.message };
  }
}

// NEW: Forgot Password Server Action
export async function forgotPassword(email: string): Promise<AuthResult> {
  await dbConnect();
  try {
    const user = await User.findOne({ email });

    if (!user) {
      // For security, always return a generic success message to prevent
      // user enumeration (revealing whether an email exists or not).
      console.warn(`Forgot password request for non-existent email: ${email}`);
      return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // --- REAL-WORLD IMPLEMENTATION STEPS (SIMULATED FOR NOW) ---
    // In a real application, you would do the following:
    // 1. Generate a unique, cryptographically secure, and time-limited reset token.
    //    Example: import crypto from 'crypto';
    //    const resetToken = crypto.randomBytes(32).toString('hex');
    //    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // 2. Save this token and its expiry to the user's document in MongoDB.
    //    user.resetPasswordToken = resetToken;
    //    user.resetPasswordExpires = resetTokenExpiry;
    //    await user.save();

    // 3. Construct the full password reset URL that the user will click.
    //    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    //    (You'd need to define NEXT_PUBLIC_APP_URL in your .env.local for deployment)

    // 4. Send an email to the user with the reset link.
    //    This requires an email sending service (e.g., Nodemailer, SendGrid, Mailgun).
    //    Example:
    //    import { sendEmail } from '@/lib/emailService'; // You'd create this utility
    //    await sendEmail({
    //      to: email,
    //      subject: 'PROPAL AI Password Reset Request',
    //      html: `<p>You requested a password reset. Click this link: <a href="${resetLink}">Reset Password</a></p>`
    //    });
    console.log(`[ACTION] Simulating sending password reset email to: ${email}`);
    // --- END REAL-WORLD IMPLEMENTATION STEPS ---

    return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };

  } catch (error: any) {
    console.error('Server Action - Forgot Password error:', error);
    return { success: false, error: 'Failed to process forgot password request: ' + error.message };
  }
}

export async function getUserProfile(email: string): Promise<AuthResult> {
  await dbConnect();
  try {
    // Select all fields except password, and lean to UserProfileDocument
    const user = await User.findOne({ email })
      .select('-password')
      .lean<UserProfileDocument>(); // Use the new specific interface

    if (!user) {
      return { success: false, error: 'User not found.' };
    }
    // Return as plain JavaScript object
    // Ensure UserType matches the fields returned by UserProfileDocument
    return { success: true, data: user as UserType }; // Cast to UserType if it aligns
  } catch (error: any) {
    console.error('Server Action - Get profile error:', error);
    return { success: false, error: 'Failed to fetch profile: ' + error.message };
  }
}

export async function updateUserProfile(email: string, updates: Partial<UserType>): Promise<AuthResult> {
  await dbConnect();
  try {
    // Ensure the password is hashed if being updated in a real application
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true } // Return the updated document
    ).select('-password').lean<UserProfileDocument>(); // Use UserProfileDocument here too

    if (!updatedUser) {
      return { success: false, error: 'User not found.' };
    }
    return { success: true, data: updatedUser as UserType }; // Cast to UserType if it aligns
  } catch (error: any) {
    console.error('Server Action - Update profile error:', error);
    return { success: false, error: 'Failed to update profile: ' + error.message };
  }
}

export async function saveAgentConfiguration(config: AgentConfigurationType, userEmail: string): Promise<AuthResult> {
  await dbConnect();
  try {
    console.log('Attempting to save config for user:', userEmail);
    console.log('Config being sent:', config);

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { agentConfig: config } },
      { new: true, upsert: false } // upsert: false because user should already exist
    ).lean<AgentConfigUserDocument>(); // Use the specific interface here

    console.log('Result of findOneAndUpdate (updatedUser):', updatedUser);

    if (!updatedUser) {
      console.error('Save Agent Config: User not found for update, updatedUser is null.');
      return { success: false, error: 'User not found for configuration update.' };
    }
    // Ensure agentConfig is returned, as that's what the frontend expects
    if (updatedUser.agentConfig) {
      console.log('AgentConfig found in updatedUser:', updatedUser.agentConfig);
      return { success: true, data: updatedUser.agentConfig };
    } else {
      console.error('Save Agent Config: Saved configuration not found in updated user document.');
      return { success: false, error: 'Saved configuration not found in updated user document.' };
    }
  } catch (error: any) {
    console.error('Server Action - Save agent config error:', error);
    return { success: false, error: 'Failed to save agent configuration: ' + error.message };
  }
}

export async function getAgentConfiguration(userEmail: string): Promise<AuthResult> {
  await dbConnect();
  try {
    // Use AgentConfigUserDocument as the lean type
    let user = await User.findOne({ email: userEmail }).select('agentConfig').lean<AgentConfigUserDocument>();

    if (!user) {
      return { success: false, error: 'User not found for agent configuration.' };
    }

    if (!user.agentConfig) {
      console.warn(`No agent configuration found for ${userEmail}. Initializing with default config.`);
      const defaultAgentConfig: AgentConfigurationType = {
        provider: 'default-provider',
        model: 'default-model',
        language: 'en-US',
        displayName: 'Default Agent',
      };

      const updatedUser = await User.findOneAndUpdate(
        { email: userEmail },
        { $set: { agentConfig: defaultAgentConfig } },
        { new: true }
      ).lean<AgentConfigUserDocument>(); // Also use the specific interface here

      if (updatedUser?.agentConfig) {
        return { success: true, data: updatedUser.agentConfig }; // Directly return the lean object
      } else {
        return { success: false, error: 'Failed to initialize default agent configuration.' };
      }
    }

    // If agentConfig exists, return it
    return { success: true, data: user.agentConfig }; // Directly return the lean object
  } catch (error: any) {
    console.error('Server Action - Get agent config error:', error);
    return { success: false, error: 'Failed to retrieve agent configuration: ' + error.message };
  }
}