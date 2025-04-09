"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser");
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const schema_1 = require("@graphql-tools/schema");
const graphql_middleware_1 = require("graphql-middleware");
// Import schema and resolvers
const schema_2 = require("./schema");
const resolvers_1 = require("./resolvers");
const context_1 = require("./context");
const permissions_1 = require("./permissions");
// Load environment variables
dotenv_1.default.config();
// Create Prisma client
exports.prisma = new client_1.PrismaClient();
async function startServer() {
    // Create Express app and HTTP server
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    // Create schema with permissions middleware
    const schema = (0, schema_1.makeExecutableSchema)({ typeDefs: schema_2.typeDefs, resolvers: resolvers_1.resolvers });
    const schemaWithPermissions = (0, graphql_middleware_1.applyMiddleware)(schema, permissions_1.permissions);
    // Create Apollo Server
    const server = new server_1.ApolloServer({
        schema: schemaWithPermissions,
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
    });
    // Start Apollo Server
    await server.start();
    // Apply middleware
    app.use('/graphql', (0, cors_1.default)({
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
    }), (0, body_parser_1.json)(), (0, express4_1.expressMiddleware)(server, {
        context: context_1.createContext,
    }));
    // Add health check endpoint
    app.get('/health', (_, res) => {
        res.status(200).send('OK');
    });
    // Start server
    const PORT = process.env.PORT || 4000;
    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}
startServer().catch((err) => {
    console.error('Error starting server:', err);
});
//# sourceMappingURL=index.js.map