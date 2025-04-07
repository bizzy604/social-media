# ConnectHub - Social Media Application

ConnectHub is a modern social media platform built with React, TypeScript, and Node.js. It features a responsive UI with real-time interactions, user authentication, post creation, likes, follows, and profile management.

![ConnectHub Screenshot](https://via.placeholder.com/800x400?text=ConnectHub+Screenshot)

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
- **React** - UI library
- **TypeScript** - Type safety and improved developer experience
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Shadcn UI** - Component library with a customizable design system
- **Axios** - HTTP requests
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Vite** - Build tool and development server

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Prisma** - ORM for database access
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

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
```DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?schema=public" JWT_SECRET="your-secret-key" VITE_API_URL="http://localhost:3001/api" ```

4. Set up the database:

```bash
npx prisma migrate dev
# or
yarn prisma:migrate
```

The application should now be running at http://localhost:5173 with the backend server at http://localhost:3001.

## Project Structure

## Available Scripts

```bash
npm run dev - Start the frontend development server
npm run server - Start the backend server
npm run dev:all - Run both frontend and backend in development mode
npm run build - Build the frontend for production
npm run prisma:generate - Generate Prisma client
npm run prisma:migrate - Run database migrations
npm run prisma:studio - Open Prisma Studio to manage data
```

## API Endpoints

### Authentication

```bash
POST /api/auth/register - Register a new user
POST /api/auth/login - Login a user
GET /api/auth/me - Get current user data
```

### Posts

```bash
GET /api/posts/feed - Get posts for the feed
POST /api/posts - Create a new post
POST /api/posts/:id/like - Like a post
DELETE /api/posts/:id/like - Unlike a post
```

### Users

```bash
GET /api/users/suggestions - Get user suggestions
GET /api/users/:username - Get user by username
GET /api/users/:id/posts - Get user's posts
GET /api/users/:id/followers - Get user's followers
GET /api/users/:id/following - Get users that the user is following
POST /api/users/:id/follow - Follow a user
DELETE /api/users/:id/follow - Unfollow a user
```

## Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Shadcn UI for the component library
- React Router for client-side routing
- Prisma for the ORM
- Tailwind CSS for styling


