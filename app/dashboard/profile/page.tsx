'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { getUserProfile, updateUserProfile } from "@/actions/auth"; // Adjust path if needed
import { User as UserType } from "@/app/types"; // Assuming app/types.ts defines UserType
import Head from "next/head";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; // Import eye icons

function ProfilePage() {
  const { userEmail, logout } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserType>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userEmail) {
        setIsLoading(true);
        setError(""); // Clear error on new fetch attempt
        try {
          const result = await getUserProfile(userEmail);
          if (result.success && result.data) {
            setUser(result.data as UserType);
            setEditedUser({ ...result.data, password: "" }); // Clear password field for security
          } else {
            setError(result.error || "Failed to load profile.");
          }
        } catch (err: any) {
          setError(`An unexpected error occurred: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setError("No user email found. Please ensure you are logged in.");
      }
    };
    fetchUserProfile();
  }, [userEmail]);

  useEffect(() => {
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      if (isEditing) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => window.removeEventListener("beforeunload", beforeUnloadHandler);
  }, [isEditing]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!userEmail) {
      setError("User email not found. Please log in again.");
      return;
    }

    const updates: Partial<UserType> = {
      username: editedUser.username,
      email: editedUser.email,
      phoneNumber: editedUser.phoneNumber,
      ...(editedUser.password && { password: editedUser.password }), // Only include password if provided
    };

    // Validation
    if (!updates.username || updates.username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (updates.email && !/\S+@\S+\.\S+/.test(updates.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    // Basic phone number validation, adjust regex if needed for specific formats
    if (updates.phoneNumber && !/^\+?[0-9\s\-().extExt]{7,20}$/.test(updates.phoneNumber)) {
      setError("Invalid phone number format.");
      return;
    }
    if (editedUser.password && editedUser.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateUserProfile(userEmail, updates);
      if (result.success && result.data) {
        setUser(result.data as UserType);
        setEditedUser({ ...result.data, password: "" }); // Clear password field after successful update
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000); // Clear success message after 3 seconds
      } else {
        setError(result.error || "Failed to update profile.");
        setTimeout(() => setError(""), 5000); // Clear error after 5 seconds
      }
    } catch (err: any) {
      setError(`An unexpected error occurred: ${err.message}`);
      setTimeout(() => setError(""), 5000); // Clear error after 5 seconds
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full bg-[var(--ui-bg-primary)] dark:bg-[var(--ui-bg-dark)] text-[var(--ui-text-primary)] dark:text-[var(--ui-text-light)]">
        <span className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></span>
        <p className="ml-3 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full bg-[var(--ui-bg-primary)] dark:bg-[var(--ui-bg-dark)] text-red-500 text-center px-4">
        Error: Could not load user profile or user not found. Please try logging in again.
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>PROPAL AI Profile</title>
        <meta name="description" content="Manage your PROPAL AI user profile, update details, and view account information." />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      {/* Outer container matches the overall page background */}
      {/* The flex and justify-center will center the profile card */}
      <div className="w-full h-full flex items-center justify-center py-10 bg-[var(--ui-bg-primary)] dark:bg-[var(--ui-bg-dark)]">
        {/* Profile Card - styled to match the image */}
        {/* CHANGED: bg-gray-900 to bg-white for light mode, text-gray-900 for dark mode text */}
        <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-lg p-8 text-gray-900 dark:bg-gray-800 dark:text-gray-100"> {/* Changed max-w-sm to max-w-md */}
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">User Profile</h2> {/* Changed text-white to text-gray-900 */}
          <div className="space-y-5"> {/* Increased spacing for better fit */}
            {error && <p className="text-red-600 text-sm text-center fade-in">{error}</p>} {/* Adjusted error text color for visibility on white */}
            {success && <p className="text-green-600 text-sm text-center fade-in">{success}</p>} {/* Adjusted success text color for visibility on white */}

            {/* Username */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-2"> {/* Added responsive layout */}
              <label className="font-medium text-gray-600 sm:w-1/3 dark:text-gray-400">Username:</label> {/* Adjusted label text color */}
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={editedUser.username || ""}
                  onChange={handleEditChange}
                  className="w-full sm:w-2/3 bg-gray-100 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" // Adjusted input colors
                />
              ) : (
                <span className="text-right sm:w-2/3">{user.username}</span>
              )}
            </div>
            {/* Email */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-2">
              <label className="font-medium text-gray-600 sm:w-1/3 dark:text-gray-400">Email:</label> {/* Adjusted label text color */}
              <span className="text-right sm:w-2/3">{user.email}</span>
            </div>
            {/* Phone Number */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-2">
              <label className="font-medium text-gray-600 sm:w-1/3 dark:text-gray-400">Phone Number:</label> {/* Adjusted label text color */}
              {isEditing ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={editedUser.phoneNumber || ""}
                  onChange={handleEditChange}
                  className="w-full sm:w-2/3 bg-gray-100 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" // Adjusted input colors
                />
              ) : (
                <span className="text-right sm:w-2/3">
                  {user.phoneNumber || "Not provided"}
                </span>
              )}
            </div>
            {/* Password */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm relative gap-2">
              <label className="font-medium text-gray-600 sm:w-1/3 dark:text-gray-400">Password:</label> {/* Adjusted label text color */}
              {isEditing ? (
                <div className="relative w-full sm:w-2/3">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={editedUser.password || ""}
                    onChange={handleEditChange}
                    className="w-full pr-10 bg-gray-100 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" // Adjusted input colors
                    placeholder="Enter new password (optional)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-blue-500 focus:outline-none dark:text-gray-400 dark:hover:text-blue-400" // Adjusted icon colors
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ) : (
                <span className="text-right sm:w-2/3">********</span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-4"> {/* Buttons centered and stacked */}
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedUser({ ...user, password: "" }); // Reset to original user data, clear password
                      setError("");
                      setSuccess("");
                    }}
                    className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-200 text-base dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white" // Adjusted cancel button colors
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 text-base">
                  Edit Profile
                </button>
              )}
            </div>
            {/* Logout */}
            <div className="pt-4 text-center">
              <button
                onClick={logout}
                className="w-full px-4 py-2.5 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-200 text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;