#!/bin/bash

# Create the project directory
mkdir users
cd users

# Initialize a new Next.js app with TypeScript
npx create-next-app@latest . --typescript

# Create the database file
touch ./forum_study.db

# Create the lib directory and files
mkdir -p app/lib
touch app/lib/db.ts
touch app/lib/auth.ts

# Create the components directory and files
mkdir -p app/components
touch app/components/LoginForm.tsx
touch app/components/ThreadView.tsx

# Create the API route
mkdir -p app/api/auth
touch app/api/auth/route.ts

# Create the pages
touch app/page.tsx
mkdir -p app/study/[userId]
touch app/study/[userId]/page.tsx

# Install dependencies
npm install sqlite3

# Start the development server
npm run dev