"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResolvers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.authResolvers = {
    Mutation: {
        register: async (_, { input }, { prisma }) => {
            const { username, email, password, name } = input;
            // Check if user already exists
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email },
                        { username },
                    ],
                },
            });
            if (existingUser) {
                throw new Error(`User with that ${existingUser.email === email ? 'email' : 'username'} already exists`);
            }
            // Hash password
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            // Create new user
            const user = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    name,
                },
            });
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
            return {
                token,
                user,
            };
        },
        login: async (_, { input }, { prisma }) => {
            const { email, password } = input;
            // Find user by email
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new Error('Invalid email or password');
            }
            // Verify password
            const passwordValid = await bcrypt_1.default.compare(password, user.password);
            if (!passwordValid) {
                throw new Error('Invalid email or password');
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
            return {
                token,
                user,
            };
        },
    },
};
//# sourceMappingURL=auth.js.map