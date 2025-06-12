

# PROPAL AI Frontend Engineering Internship Project

This repository contains my solution for the PROPAL AI Frontend Engineering Internship technical task. The project is a Next.js application designed to evaluate frontend skills in building an authentication and settings dashboard.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Configuration](#configuration)
- [Live Demo (if applicable)](#live-demo-if-applicable)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

This application implements the following key functionalities:

### User Authentication & Management
* **User Registration:** Allows new users to sign up with a username, email, password, and optional phone number. Data is saved to **MongoDB**.
* **User Login:** Authenticates users by validating credentials against saved data in MongoDB.
* **Protected Routes:** The dashboard and its sub-pages (`/dashboard/profile`, `/dashboard/agent`) are protected, requiring user authentication.
* **User Profile Page (`/dashboard/profile`):**
    * Displays authenticated user's username, email, and phone number.
    * Allows updating username, email, phone number, and password. Changes are persisted in MongoDB.

### Agent Configuration Dashboard
* **Agent Configuration Page (`/dashboard/agent`):**
    * Loads available STT (Speech-to-Text) providers, models, and languages from `public/tts.json` (or `stt.json`).
    * Features **three interdependent dropdowns** (Provider, Model, Language): selecting an option in one dropdown dynamically filters options in the subsequent ones.
    * Automatically generates and displays an "Agent Display Name" based on the selected language and model.
    * **Persists selected agent configurations to MongoDB** for each user, ensuring settings are saved and loaded correctly across sessions.

### UI/UX & Styling
* **Clean and Responsive Design:** Built with **Tailwind CSS** for a modern, mobile-first, and easily maintainable user interface.
* **Dashboard Layout:** Features a fixed sidebar for consistent navigation across dashboard pages.
* **Active Link Highlighting:** The current active page in the sidebar is visually highlighted.
* **Dark Mode Toggle:** Supports switching between light and dark themes, enhancing user experience and visual comfort.
* **Feedback Messages:** Provides clear success and error messages for all user actions (login, signup, profile updates, agent config saves).
* **Smooth Transitions:** Implements subtle UI animations and transitions for a polished feel.

## Tech Stack

* **Frontend Framework:** [Next.js](https://nextjs.org/) (App Router)
* **UI Framework:** [Tailwind CSS](https://tailwindcss.com/)
* **JavaScript Library:** [React.js](https://react.dev/)
* **State Management:** React Hooks (`useState`, `useEffect`), React Context API (for Auth and Theme)
* **Database:** [MongoDB](https://www.mongodb.com/)
* **ORM/ODM:** [Mongoose](https://mongoosejs.com/)
* **Backend Logic:** Next.js Server Actions
* **Language:** [TypeScript](https://www.typescriptlang.org/)

## Project Structure

.
├── public/
│   ├── tts.json          # STT configuration data
│   └── ...
├── app/
│   ├── api/              # (Optional) For any custom API routes
│   ├── components/       # Reusable React components (e.g., AuthProvider, ThemeContext, Sidebar)
│   ├── dashboard/
│   │   ├── agent/        # Agent Configuration page
│   │   │   └── page.tsx
│   │   ├── profile/      # User Profile page
│   │   │   └── page.tsx
│   │   └── layout.tsx    # Dashboard layout with sidebar
│   ├── login/
│   │   ├── signup/       # Signup page
│   │   │   └── page.tsx
│   │   └── page.tsx      # Login page
│   ├── page.tsx          # Landing page
│   └── types.ts          # Centralized TypeScript interfaces
├── actions/
│   └── auth.ts           # Server Actions for authentication and user/agent data handling
├── lib/
│   └── dbConnect.ts      # MongoDB connection utility
├── models/
│   └── User.ts           # Mongoose User schema and model
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── .env.local            # Environment variables (e.g., MONGODB_URI)
└── ...


## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

* Node.js (v18.x or later recommended)
* npm or Yarn (npm recommended)
* A MongoDB database (local or cloud-based like MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [your-repo-url]
    cd [your-repo-name]
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Create a `.env.local` file** in the root of your project and add your MongoDB connection URI:
    ```
    MONGODB_URI=your_mongodb_connection_string
    ```
    Replace `your_mongodb_connection_string` with your actual MongoDB URI (e.g., `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority`). The database name for this project is `Prop-aitask`, so ensure your URI points to or creates this database.

### Running the Application

To start the development server:

```bash
npm run dev
# or
yarn dev