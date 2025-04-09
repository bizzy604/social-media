import { Context } from '../context';

export const commentResolvers = {
  Mutation: {
    createComment: async (_: any, { postId, content }: { postId: string; content: string }, { prisma, userId }: Context) => {
      if (!userId) throw new Error('Not authenticated');
      
      // Check if post exists
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) throw new Error('Post not found');
      
      // Create new comment
      return prisma.comment.create({
        data: {
          content,
          author: { connect: { id: userId } },
          post: { connect: { id: postId } },
        },
      });
    },
    
    updateComment: async (_: any, { id, content }: { id: string; content: string }, { prisma, userId }: Context) => {
      if (!userId) throw new Error('Not authenticated');
      
      const comment = await prisma.comment.findUnique({ where: { id } });
      
      if (!comment) throw new Error('Comment not found');
      if (comment.authorId !== userId) throw new Error('Not authorized');
      
      return prisma.comment.update({
        where: { id },
        data: { content },
      });
    },
    
    deleteComment: async (_: any, { id }: { id: string }, { prisma, userId }: Context) => {
      if (!userId) throw new Error('Not authenticated');
      
      const comment = await prisma.comment.findUnique({ where: { id } });
      
      if (!comment) throw new Error('Comment not found');
      if (comment.authorId !== userId) throw new Error('Not authorized');
      
      await prisma.comment.delete({ where: { id } });
      return true;
    },
  },
  
  Comment: {
    author: ({ authorId }: { authorId: string }, _: any, { loaders }: Context) => {
      return loaders.userLoader.load(authorId);
    },
    
    post: ({ postId }: { postId: string }, _: any, { loaders }: Context) => {
      return loaders.postLoader.load(postId);
    },
  },
};
