import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';

// Import schema and resolvers
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';
import { permissions } from './permissions';

// Load environment variables
dotenv.config();

// Create Prisma client
export const prisma = new PrismaClient();

async function startServer() {
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Create schema with permissions middleware
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const schemaWithPermissions = applyMiddleware(schema, permissions);

  // Create Apollo Server
  const server = new ApolloServer({
    schema: schemaWithPermissions,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Start Apollo Server
  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    }),
    json(),
    expressMiddleware(server, {
      context: createContext,
    }),
  );

  // Add health check endpoint
  app.get('/health', (_, res) => {
    res.status(200).send('OK');
  });

  // Start server
  const PORT = process.env.PORT || 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
