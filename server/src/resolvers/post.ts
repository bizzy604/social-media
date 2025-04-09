import { Context } from '../context';

export const postResolvers = {
  Query: {
    post: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return prisma.post.findUnique({ where: { id } });
    },
    
    feed: async (_: any, { first, skip }: { first?: number; skip?: number }, { prisma, userId }: Context) => {
      if (!userId) return [];
      
      // Get IDs of users the current user is following
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      
      const followingIds = following.map(f => f.followingId);
      
      // Include the user's own posts in the feed
      const userIds = [...followingIds, userId];
      
      return prisma.post.findMany({
        where: {
          authorId: { in: userIds },
        },
        orderBy: { createdAt: 'desc' },
        take: first || 10,
        skip: skip || 0,
      });
    },
    
    userPosts: (_: any, { userId, first, skip }: { userId: string; first?: number; skip?: number }, { prisma }: Context) => {
      return prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        take: first || 10,
        skip: skip || 0,
      });
    },
  },
  
  Mutation: {
    createPost: async (_: any, { content }: { content: string }, { prisma, userId }: Context) => {
      if (!userId) throw new Error('Not authenticated');
      
      return prisma.post.create({
        data: {
          content,
          author: { connect: { id: userId } },
        },
      });
    },
    
    updatePost: async (_: any, { id, content }: { id: string; content: string }, { prisma, userId }: Context) => {
      if (!userId) throw new Error('Not authenticated');
      
      const post = await prisma.post.findUnique({ where: { id } });
      
      if (!post) throw new Error('Post not found');
      if (post.authorId !== userId) throw new Error('Not authorized');
      
      return prisma.post.update({
        where: { id },
        data: { content },
      });
    },
    
    deletePost: async (_: any, { id }: { id: string }, { prisma, userId }: Context) => {
      if (!userId) throw new Error('Not authenticated');
      
      const post = await prisma.post.findUnique({ where: { id } });
      
      if (!post) throw new Error('Post not found');
      if (post.authorId !== userId) throw new Error('Not authorized');
      
      await prisma.post.delete({ where: { id } });
      return true;
    },
  },
  
  Post: {
    author: ({ authorId }: { authorId: string }, _: any, { loaders }: Context) => {
      return loaders.userLoader.load(authorId);
    },
    
    likes: ({ id }: { id: string }, _: any, { prisma }: Context) => {
      return prisma.like.findMany({ where: { postId: id } });
    },
    
    comments: ({ id }: { id: string }, _: any, { prisma }: Context) => {
      return prisma.comment.findMany({
        where: { postId: id },
        orderBy: { createdAt: 'desc' },
      });
    },
    
    liked: async ({ id }: { id: string }, _: any, { prisma, userId }: Context) => {
      if (!userId) return false;
      
      const like = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId: id,
          },
        },
      });
      
      return !!like;
    },
    
    _count: async ({ id }: { id: string }, _: any, { prisma }: Context) => {
      const [likesCount, commentsCount] = await Promise.all([
        prisma.like.count({ where: { postId: id } }),
        prisma.comment.count({ where: { postId: id } }),
      ]);
      
      return {
        likes: likesCount,
        comments: commentsCount,
      };
    },
  },
};
