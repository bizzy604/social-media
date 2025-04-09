import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Context } from '../context';

type RegisterInput = {
  username: string;
  email: string;
  password: string;
  name?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export const authResolvers = {
  Mutation: {
    register: async (_: any, { input }: { input: RegisterInput }, { prisma }: Context) => {
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
        throw new Error(
          `User with that ${existingUser.email === email ? 'email' : 'username'} already exists`
        );
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
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
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '30d' }
      );
      
      return {
        token,
        user,
      };
    },
    
    login: async (_: any, { input }: { input: LoginInput }, { prisma }: Context) => {
      const { email, password } = input;
      
      // Find user by email
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password);
      
      if (!passwordValid) {
        throw new Error('Invalid email or password');
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '30d' }
      );
      
      return {
        token,
        user,
      };
    },
  },
};
