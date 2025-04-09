import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

export const createLoaders = (prisma: PrismaClient) => {
  // User loader - batches user queries by ID
  const userLoader = new DataLoader(async (userIds: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: {
        id: { in: [...userIds] },
      },
    });

    // Map the users to the correct order of the requested IDs
    const userMap = users.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {} as Record<string, any>);

    return userIds.map(id => userMap[id] || null);
  });

  // Post loader - batches post queries by ID
  const postLoader = new DataLoader(async (postIds: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: {
        id: { in: [...postIds] },
      },
    });

    // Map the posts to the correct order of the requested IDs
    const postMap = posts.reduce((map, post) => {
      map[post.id] = post;
      return map;
    }, {} as Record<string, any>);

    return postIds.map(id => postMap[id] || null);
  });

  return {
    userLoader,
    postLoader,
  };
};
