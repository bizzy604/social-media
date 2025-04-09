# Bizzy - Social Media Application

Bizzy is a modern social media platform built with React, TypeScript, and Node.js. It features a responsive UI with real-time interactions, user authentication, post creation, likes, follows, and profile management. This application uses GraphQL for efficient API queries and mutations.

![Bizzy Screenshot](https://via.placeholder.com/800x400?text=Bizzy+Screenshot)

## Project Overview

This project is a social media platform where users can register, log in, post updates, like posts, and follow/unfollow other users. The focus is on delivering a clean, well-architected full-stack application using modern technologies with GraphQL as the API layer.

## Features

- **User Authentication**
  - Registration and login system
  - JWT-based authentication
  - Protected routes
  
- **User Profiles**
  - Profile pages with user information
  - Follow/unfollow functionality
  - Display of followers and following counts
  - Post history on profile pages
  
- **Social Feed**
  - Post creation with text content
  - News feed with posts from followed users
  - Like/unlike posts
  - Infinite scroll for loading more posts

- **User Interaction**
  - User suggestions to follow
  - Responsive UI for both desktop and mobile
  - Real-time updates for likes and follows

## Tech Stack

### Frontend
- **React (Vite)** - UI library for building dynamic user interfaces
- **TypeScript** - Type safety and improved developer experience
- **Apollo Client** - GraphQL client for data fetching and state management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Shadcn UI** - Component library with a customizable design system
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework for handling requests
- **Apollo Server** - GraphQL server implementation
- **GraphQL** - API query language and runtime
- **Prisma ORM** - Database interactions and schema management
- **PostgreSQL** - Relational database for data persistence
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **GraphQL Shield** - Permission management for GraphQL

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/bizzy604/social-media.git
cd social-media
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following variables:
```bash
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?schema=public"
JWT_SECRET="your-secret-key"
PORT=4000
```

4. Set up the database:

```bash
npx prisma migrate dev
# or
yarn prisma:migrate
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application should now be running with the frontend at http://localhost:5173 and the GraphQL server at http://localhost:4000/graphql.

## Architectural Decisions

### Frontend Architecture

1. **Component Structure**
   - Modular component architecture separating UI components from business logic
   - Reusable UI components with Shadcn UI to maintain design consistency
   - Custom hooks for GraphQL operations

2. **State Management**
   - Apollo Client for GraphQL state management and caching
   - Context API for global authentication state
   - Local component state for UI-specific state

3. **Routing Strategy**
   - Protected routes for authenticated areas
   - Public routes for authentication pages
   - Dynamic routing for user profiles and post details

### Backend Architecture

1. **API Design**
   - GraphQL API with Apollo Server
   - Type-safe schema with GraphQL Code Generator
   - Modular resolvers organized by domain
   - Dataloaders for efficient database access

2. **Database Schema**
   - Normalized database design with proper relationships
   - Prisma for type-safe database queries
   - Efficient database access patterns for complex queries

3. **Security Measures**
   - Password hashing with bcrypt
   - JWT for stateless authentication
   - GraphQL Shield for permission management
   - Input validation with GraphQL validation directives

## GraphQL Schema

The GraphQL schema is organized into the following main types:

### User
```graphql
type User {
  id: ID!
  username: String!
  email: String!
  name: String
  bio: String
  avatar: String
  followers: [User!]
  following: [User!]
  posts: [Post!]
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Post
```graphql
type Post {
  id: ID!
  content: String!
  author: User!
  likes: [Like!]
  comments: [Comment!]
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Like
```graphql
type Like {
  id: ID!
  user: User!
  post: Post!
  createdAt: DateTime!
}
```

### Comment
```graphql
type Comment {
  id: ID!
  content: String!
  author: User!
  post: Post!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Main Queries
```graphql
type Query {
  me: User
  user(id: ID, username: String): User
  users(query: String, first: Int, skip: Int): [User!]!
  post(id: ID!): Post
  feed(first: Int, skip: Int): [Post!]!
  userPosts(userId: ID!, first: Int, skip: Int): [Post!]!
  userSuggestions(first: Int): [User!]!
}
```

### Main Mutations
```graphql
type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  createPost(content: String!): Post!
  updatePost(id: ID!, content: String!): Post!
  deletePost(id: ID!): Boolean!
  likePost(postId: ID!): Like!
  unlikePost(postId: ID!): Boolean!
  followUser(userId: ID!): Boolean!
  unfollowUser(userId: ID!): Boolean!
  updateProfile(input: UpdateProfileInput!): User!
}
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── graphql/        # GraphQL queries and mutations
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   ├── styles/         # Global styles
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                 # Backend GraphQL server
│   ├── src/
│   │   ├── context.ts      # GraphQL context creation
│   │   ├── dataloaders/    # Efficient data loading
│   │   ├── directives/     # GraphQL schema directives
│   │   ├── generated/      # Generated GraphQL types
│   │   ├── permissions/    # GraphQL Shield rules
│   │   ├── resolvers/      # GraphQL resolvers
│   │   ├── schema/         # GraphQL schema definitions
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── .env                    # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Available Scripts

```bash
# Frontend
npm run dev:client - Start the frontend development server
npm run build:client - Build the frontend for production

# Backend
npm run dev:server - Start the backend GraphQL server
npm run build:server - Build the backend for production

# Full stack
npm run dev - Run both frontend and backend in development mode
npm run build - Build both frontend and backend for production

# Database
npm run prisma:generate - Generate Prisma client
npm run prisma:migrate - Run database migrations
npm run prisma:studio - Open Prisma Studio to manage data

# GraphQL
npm run codegen - Generate TypeScript types from GraphQL schema
```

## GraphQL API Playground

When running in development mode, the GraphQL Playground is available at http://localhost:4000/graphql. This interactive tool allows you to explore the schema and test queries and mutations.

## Deployment

### Frontend Deployment (Vercel)

1. **Sign up for Vercel**:
   - Create an account at [Vercel](https://vercel.com/)
   - Install the Vercel CLI: `npm i -g vercel`

2. **Deploy your frontend**:
   ```bash
   # From your client directory
   vercel
   ```

3. **Configure environment variables**:
   - In the Vercel dashboard, add the `VITE_GRAPHQL_URL` environment variable pointing to your GraphQL API URL

### Backend Deployment (Railway)

1. **Sign up for Railway**:
   - Create an account at [Railway](https://railway.app/)
   - Install the Railway CLI:
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Initialize your project**:
   ```bash
   # Navigate to your server directory
   cd server
   railway init
   ```

3. **Set up environment variables**:
   - In the Railway dashboard, add:
     - `DATABASE_URL` (your PostgreSQL URL)
     - `JWT_SECRET`
     - `PORT` (usually set automatically)
     - `CORS_ORIGIN` (your frontend URL)

4. **Deploy your application**:
   ```bash
   railway up
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Apollo GraphQL](https://www.apollographql.com/) for GraphQL client and server
- [Shadcn UI](https://ui.shadcn.com/) for the component library
- [React Router](https://reactrouter.com/) for client-side routing
- [Prisma](https://www.prisma.io/) for the ORM
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Neon](https://neon.tech/) for serverless PostgreSQL database
- [Vercel](https://vercel.com/) for frontend hosting
