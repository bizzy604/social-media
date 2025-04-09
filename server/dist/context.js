"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("./index");
const dataloaders_1 = require("./dataloaders");
const createContext = async ({ req }) => {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = null;
    if (token) {
        try {
            // Verify the token and extract the userId
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            userId = decoded.userId;
        }
        catch (error) {
            // Token is invalid or expired
            console.error('Invalid token:', error);
        }
    }
    // Create and return the context object
    return {
        prisma: index_1.prisma,
        userId,
        loaders: (0, dataloaders_1.createLoaders)(index_1.prisma),
    };
};
exports.createContext = createContext;
//# sourceMappingURL=context.js.map