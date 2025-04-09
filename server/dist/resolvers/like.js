"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeResolvers = void 0;
exports.likeResolvers = {
    Mutation: {
        likePost: async (_, { postId }, { prisma, userId }) => {
            if (!userId)
                throw new Error('Not authenticated');
            // Check if post exists
            const post = await prisma.post.findUnique({ where: { id: postId } });
            if (!post)
                throw new Error('Post not found');
            // Check if already liked
            const existingLike = await prisma.like.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
            if (existingLike)
                return existingLike;
            // Create new like
            return prisma.like.create({
                data: {
                    user: { connect: { id: userId } },
                    post: { connect: { id: postId } },
                },
            });
        },
        unlikePost: async (_, { postId }, { prisma, userId }) => {
            if (!userId)
                throw new Error('Not authenticated');
            try {
                await prisma.like.delete({
                    where: {
                        userId_postId: {
                            userId,
                            postId,
                        },
                    },
                });
                return true;
            }
            catch (error) {
                return false;
            }
        },
    },
    Like: {
        user: ({ userId }, _, { loaders }) => {
            return loaders.userLoader.load(userId);
        },
        post: ({ postId }, _, { loaders }) => {
            return loaders.postLoader.load(postId);
        },
    },
};
//# sourceMappingURL=like.js.map