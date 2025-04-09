"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResolvers = void 0;
exports.postResolvers = {
    Query: {
        post: async (_, { id }, { prisma }) => {
            return prisma.post.findUnique({ where: { id } });
        },
        feed: async (_, { first, skip }, { prisma, userId }) => {
            if (!userId)
                return [];
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
        userPosts: (_, { userId, first, skip }, { prisma }) => {
            return prisma.post.findMany({
                where: { authorId: userId },
                orderBy: { createdAt: 'desc' },
                take: first || 10,
                skip: skip || 0,
            });
        },
    },
    Mutation: {
        createPost: async (_, { content }, { prisma, userId }) => {
            if (!userId)
                throw new Error('Not authenticated');
            return prisma.post.create({
                data: {
                    content,
                    author: { connect: { id: userId } },
                },
            });
        },
        updatePost: async (_, { id, content }, { prisma, userId }) => {
            if (!userId)
                throw new Error('Not authenticated');
            const post = await prisma.post.findUnique({ where: { id } });
            if (!post)
                throw new Error('Post not found');
            if (post.authorId !== userId)
                throw new Error('Not authorized');
            return prisma.post.update({
                where: { id },
                data: { content },
            });
        },
        deletePost: async (_, { id }, { prisma, userId }) => {
            if (!userId)
                throw new Error('Not authenticated');
            const post = await prisma.post.findUnique({ where: { id } });
            if (!post)
                throw new Error('Post not found');
            if (post.authorId !== userId)
                throw new Error('Not authorized');
            await prisma.post.delete({ where: { id } });
            return true;
        },
    },
    Post: {
        author: ({ authorId }, _, { loaders }) => {
            return loaders.userLoader.load(authorId);
        },
        likes: ({ id }, _, { prisma }) => {
            return prisma.like.findMany({ where: { postId: id } });
        },
        comments: ({ id }, _, { prisma }) => {
            return prisma.comment.findMany({
                where: { postId: id },
                orderBy: { createdAt: 'desc' },
            });
        },
        liked: async ({ id }, _, { prisma, userId }) => {
            if (!userId)
                return false;
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
        _count: async ({ id }, _, { prisma }) => {
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
//# sourceMappingURL=post.js.map