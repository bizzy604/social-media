"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentResolvers = void 0;
exports.commentResolvers = {
    Mutation: {
        createComment: async (_, { postId, content }, { prisma, userId }) => {
            if (!userId)
                throw new Error('Not authenticated');
            // Check if post exists
            const post = await prisma.post.findUnique({ where: { id: postId } });
            if (!post)
                throw new Error('Post not found');
            // Create new comment
            return prisma.comment.create({
                data: {
                    content,
                    author: { connect: { id: userId } },
                    post: { connect: { id: postId } },
                },
            });
        },
        updateComment: async (_, { id, content }, { prisma, userId }) => {
            if (!userId)
                throw new Error('Not authenticated');
            const comment = await prisma.comment.findUnique({ where: { id } });
            if (!comment)
                throw new Error('Comment not found');
            if (comment.authorId !== userId)
                throw new Error('Not authorized');
            return prisma.comment.update({
                where: { id },
                data: { content },
            });
        },
        deleteComment: async (_, { id }, { prisma, userId }) => {
            if (!userId)
                throw new Error('Not authenticated');
            const comment = await prisma.comment.findUnique({ where: { id } });
            if (!comment)
                throw new Error('Comment not found');
            if (comment.authorId !== userId)
                throw new Error('Not authorized');
            await prisma.comment.delete({ where: { id } });
            return true;
        },
    },
    Comment: {
        author: ({ authorId }, _, { loaders }) => {
            return loaders.userLoader.load(authorId);
        },
        post: ({ postId }, _, { loaders }) => {
            return loaders.postLoader.load(postId);
        },
    },
};
//# sourceMappingURL=comment.js.map