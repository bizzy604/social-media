# ConnectHub - Social Media Application

ConnectHub is a modern social media platform built with React, TypeScript, and Node.js. It features a responsive UI with real-time interactions, user authentication, post creation, likes, follows, and profile management.

![ConnectHub Screenshot](https://via.placeholder.com/800x400?text=ConnectHub+Screenshot)

## Project Overview

This project was built as a basic social media feed where users can register, log in, post updates, like posts, and follow/unfollow other users. The focus was on delivering a clean, well-architected full-stack application using specific technologies.

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
- **TypeScript** - Type safety and improved developer experience across React components
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Shadcn UI** - Component library with a customizable design system
- **Axios** - HTTP requests
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework for handling requests and server-side logic
- **Prisma ORM** - Database interactions and schema management
- **PostgreSQL** - Relational database for data persistence
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

## Architectural Decisions

### Frontend Architecture

1. **Component Structure**
   - Utilized a modular component architecture separating UI components from business logic
   - Implemented reusable UI components with Shadcn UI to maintain design consistency
   - Used container/presentation pattern to separate data fetching from rendering

2. **State Management**
   - Context API for global authentication state to avoid prop drilling
   - React Query for server state management and caching
   - Local component state for UI-specific state

3. **Routing Strategy**
   - Protected routes for authenticated areas
   - Public routes for authentication pages
   - Dynamic routing for user profiles and post details

### Backend Architecture

1. **API Design**
   - RESTful API endpoints organized by resource
   - JWT token-based authentication for secure API access
   - Middleware for authentication and error handling

2. **Database Schema**
   - Normalized database design with proper relationships
   - Used Prisma for type-safe database queries
   - Implemented efficient joins for complex queries like feed generation

3. **Security Measures**
   - Password hashing with bcrypt
   - JWT for stateless authentication
   - Input validation on both client and server
   - Protected routes with authentication middleware

## Trade-offs and Assumptions

1. **Performance Trade-offs**
   - Opted for a simpler API design over GraphQL to reduce initial complexity
   - Used infinite scroll for posts to reduce initial load time but with the trade-off of more API calls

2. **Assumptions**
   - Users have modern browsers with JavaScript enabled
   - Small to medium user base (scalability considerations would differ for larger user bases)
   - Basic social features would satisfy initial requirements (more complex features like messaging would be added later)

3. **Scalability Considerations**
   - Database connection pooling setup for improved performance
   - Pagination implemented for listing endpoints to handle growth
   - Stateless authentication to allow for horizontal scaling

## Deployment

The application is deployed using the following services:

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Railway or Heroku
- **Database**: Uses Neon PostgreSQL (serverless Postgres)

Live demo: [https://connecthub-social.vercel.app](https://connecthub-social.vercel.app)

### Backend Deployment Guide

#### Option 1: Deploy on Railway

1. **Create a Railway account**:
   - Sign up at [railway.app](https://railway.app)

2. **Install the Railway CLI**:
   ```bash
   npm i -g @railway/cli
   # Login to your account
   railway login
   ```

3. **Initialize your project**:
   ```bash
   # Navigate to your backend directory
   cd server
   # Link to Railway project
   railway init
   ```

4. **Set up environment variables**:
   - In the Railway dashboard, go to your project
   - Click on "Variables" and add:
     - `DATABASE_URL` (your Neon PostgreSQL URL)
     - `JWT_SECRET`
     - `PORT` (usually set automatically)
     - Any other environment variables needed

5. **Deploy your application**:
   ```bash
   railway up
   ```

6. **Set up auto-deployment** (optional):
   - Connect your GitHub repository in the Railway dashboard
   - Enable automatic deployments on push to main branch

#### Option 2: Deploy on Heroku

1. **Create a Heroku account**:
   - Sign up at [heroku.com](https://heroku.com)

2. **Install the Heroku CLI**:
   ```bash
   npm install -g heroku
   # Login to your account
   heroku login
   ```

3. **Create a new Heroku app**:
   ```bash
   # Navigate to your backend directory
   cd server
   # Create a new Heroku app
   heroku create connecthub-api
   ```

4. **Add a Procfile**:
   Create a file named `Procfile` (no extension) in your backend directory:
   ```
   web: node dist/index.js
   ```

5. **Set up environment variables**:
   ```bash
   heroku config:set DATABASE_URL="your-neon-postgres-url"
   heroku config:set JWT_SECRET="your-jwt-secret"
   # Add any other required environment variables
   ```

6. **Deploy your application**:
   ```bash
   git subtree push --prefix server heroku main
   # If your backend is in a subdirectory named "server"
   ```

7. **Set up auto-deployment** (optional):
   - Connect your GitHub repository in the Heroku dashboard
   - Enable automatic deployments on push to main branch

### Important Deployment Considerations

1. **Database migrations**:
   - Make sure to run Prisma migrations on deployment:
     ```bash
     # For Railway, add this to your package.json scripts
     "postdeploy": "prisma migrate deploy"
     ```

2. **CORS configuration**:
   - Update your CORS settings to allow requests from your frontend domain:
     ```javascript
     app.use(cors({
       origin: process.env.FRONTEND_URL || 'https://connecthub-social.vercel.app',
       credentials: true
     }));
     ```

3. **Update frontend API URL**:
   - After deploying your backend, update the `VITE_API_URL` in your frontend environment to point to your new backend URL

4. **Health check endpoint**:
   - Add a simple health check endpoint to verify your backend is running:
     ```javascript
     app.get('/health', (req, res) => {
       res.status(200).send('OK');
     });
     ```

5. **Monitoring and logs**:
   - Both Railway and Heroku provide log dashboards to monitor your application
   - Set up error tracking with a service like Sentry for production monitoring

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Shadcn UI](https://ui.shadcn.com/) for the component library
- [React Router](https://reactrouter.com/) for client-side routing
- [Prisma](https://www.prisma.io/) for the ORM
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Neon](https://neon.tech/) for serverless PostgreSQL database
- [Vercel](https://vercel.com/) for frontend hosting


