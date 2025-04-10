# Social Media Frontend

This is the frontend for the Social Media application built with:

- Vite
- React
- Apollo Client
- TypeScript
- Tailwind CSS
- Shadcn UI components

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create a `.env` file with the following variables:
\`\`\`
VITE_GRAPHQL_URL=http://localhost:4000/graphql
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Project Structure

- `src/components`: React components
- `src/contexts`: Context providers
- `src/graphql`: GraphQL queries and mutations
- `src/lib`: Utility functions
- `src/pages`: Page components

## Building for Production

To build the application for production, run:
\`\`\`bash
npm run build
\`\`\`

This will create a `dist` directory with the compiled assets ready for deployment.

## Features

- User authentication (sign up, sign in)
- Create and view posts
- Like posts
- Follow/unfollow users
- View user profiles
- Explore new users to follow

## Technologies Used

- **React**: UI library
- **React Router**: For navigation
- **Apollo Client**: For GraphQL data fetching
- **Tailwind CSS**: For styling
- **Shadcn UI**: For UI components
- **Zod**: For form validation
- **React Hook Form**: For form handling
