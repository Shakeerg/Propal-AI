'use server';

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
// You'll need to import or implement an email sending utility
// import { sendEmail } from '@/lib/emailService'; // Example

export async function forgotPassword(email: string) {
  await dbConnect();
  try {
    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if the email doesn't exist
      console.warn(`Forgot password request for non-existent email: ${email}`);
      return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // In a real app:
    // 1. Generate a unique, time-limited reset token (e.g., using crypto.randomBytes)
    // 2. Save the token and its expiry to the user's document in MongoDB
    // 3. Construct the password reset URL (e.g., https://your-app.com/reset-password?token=YOUR_TOKEN)
    // 4. Send an email to the user with this link

    console.log(`Simulating sending password reset email to: ${email}`);
    // await sendEmail({
    //   to: email,
    //   subject: 'Password Reset Request',
    //   text: `Please use the following link to reset your password: ${resetLink}`
    // });

    return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };

  } catch (error: any) {
    console.error('Forgot password server action error:', error);
    return { success: false, error: 'Failed to process forgot password request.' };
  }
}