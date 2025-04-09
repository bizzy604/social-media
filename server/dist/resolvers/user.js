"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
exports.userResolvers = {
    Query: {
        me: (_, __, { prisma, userId }) => {
            if (!userId)
                return null;
            return prisma.user.findUnique({ where: { id: userId } });
        },
        user: async (_, { id, username }, { prisma }) => {
            if (id)
                return prisma.user.findUnique({ where: { id } });
            if (username) {
                // First try exact match
                const exactMatch = await prisma.user.findUnique({ where: { username } });
                if (exactMatch)
                    return exactMatch;
                // Then try case-insensitive match
                const users = await prisma.user.findMany({
                    where: {
                        username: {
                            mode: 'insensitive',
                            equals: username
                        }
                    },
                    take: 1
                });
                return users[0] || null;
            }
            throw new Error('You must provide either an id or a username');
        },
        users: (_, { query, first, skip }, { prisma }) => {
            return prisma.user.findMany({
                where: query ? {
                    OR: [
                        { username: { contains: query, mode: 'insensitive' } },
                        { name: { contains: query, mode: 'insensitive' } },
                    ],
                } : undefined,
                take: first || 10,
                skip: skip || 0,
            });
        },
        userSuggestions: async (_, { first }, { prisma, userId }) => {
            if (!userId)
                return [];
            // Find users that the current user is not following
            const following = await prisma.follow.findMany({
                where: { followerId: userId },
                select: { followingId: true },
            });
            const followingIds = following.map(f => f.followingId);
            return prisma.user.findMany({
                where: {
                    id: { not: userId },
                },
                take: first || 5,
                orderBy: { createdAt: 'desc' },
            });
        },
    },
    Mutation: {
        followUser: async (_, { userId: userToFollowId }, { prisma, userId }) => {
            if (!userId)
                throw new Error('Not authenticated');
            if (userId === userToFollowId)
                throw new Error('You cannot follow yourself');
            // Check if already following
            const existingFollow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: userToFollowId,
                    },
                },
            });
            if (existingFollow)
                return true; // Already following
            await prisma.follow.create({
                data: {
                    follower: { connect: { id: userId } },
                    following: { connect: { id: userToFollowId } },
                },
            });
            return true;
        },
        unfollowUser: async (_, { userId: userToUnfollowId }, { prisma, userId }) => {
            if (!userId)
                throw new Error('Not authenticated');
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: userToUnfollowId,
                    },
                },
            }).catch(() => false); // If not following, just return false
            return true;
        },
        updateProfile: async (_, { input }, { prisma, userId }) => {
            if (!userId)
                throw new Error('Not authenticated');
            return prisma.user.update({
                where: { id: userId },
                data: input,
            });
        },
    },
    User: {
        followers: async ({ id }, _, { prisma, loaders }) => {
            const follows = await prisma.follow.findMany({
                where: { followingId: id },
                select: { followerId: true },
            });
            const followerIds = follows.map(f => f.followerId);
            return loaders.userLoader.loadMany(followerIds);
        },
        following: async ({ id }, _, { prisma, loaders }) => {
            const follows = await prisma.follow.findMany({
                where: { followerId: id },
                select: { followingId: true },
            });
            const followingIds = follows.map(f => f.followingId);
            return loaders.userLoader.loadMany(followingIds);
        },
        posts: ({ id }, _, { prisma }) => {
            return prisma.post.findMany({
                where: { authorId: id },
                orderBy: { createdAt: 'desc' },
            });
        },
        _count: async ({ id }, _, { prisma }) => {
            const [followersCount, followingCount, postsCount] = await Promise.all([
                prisma.follow.count({ where: { followingId: id } }),
                prisma.follow.count({ where: { followerId: id } }),
                prisma.post.count({ where: { authorId: id } }),
            ]);
            return {
                followers: followersCount,
                following: followingCount,
                posts: postsCount,
            };
        },
    },
};
//# sourceMappingURL=user.js.map