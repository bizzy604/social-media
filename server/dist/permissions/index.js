"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions = void 0;
const graphql_shield_1 = require("graphql-shield");
// Rule to check if a user is authenticated
const isAuthenticated = (0, graphql_shield_1.rule)({ cache: 'contextual' })(async (_, __, { userId }) => {
    return userId !== null ? true : new Error('Not authenticated');
});
// Rule to check if a user owns a post
const isPostOwner = (0, graphql_shield_1.rule)({ cache: 'contextual' })(async (_, { id }, { prisma, userId }) => {
    if (!userId)
        return new Error('Not authenticated');
    const post = await prisma.post.findUnique({ where: { id } });
    return post?.authorId === userId ? true : new Error('Not authorized');
});
// Rule to check if a user owns a comment
const isCommentOwner = (0, graphql_shield_1.rule)({ cache: 'contextual' })(async (_, { id }, { prisma, userId }) => {
    if (!userId)
        return new Error('Not authenticated');
    const comment = await prisma.comment.findUnique({ where: { id } });
    return comment?.authorId === userId ? true : new Error('Not authorized');
});
// Define permissions for each type and field
exports.permissions = (0, graphql_shield_1.shield)({
    Query: {
        me: isAuthenticated,
        feed: isAuthenticated,
        userPosts: graphql_shield_1.allow,
        post: graphql_shield_1.allow,
        user: graphql_shield_1.allow,
        users: graphql_shield_1.allow,
        userSuggestions: isAuthenticated,
    },
    Mutation: {
        register: graphql_shield_1.allow,
        login: graphql_shield_1.allow,
        createPost: isAuthenticated,
        updatePost: (0, graphql_shield_1.and)(isAuthenticated, isPostOwner),
        deletePost: (0, graphql_shield_1.and)(isAuthenticated, isPostOwner),
        likePost: isAuthenticated,
        unlikePost: isAuthenticated,
        createComment: isAuthenticated,
        updateComment: (0, graphql_shield_1.and)(isAuthenticated, isCommentOwner),
        deleteComment: (0, graphql_shield_1.and)(isAuthenticated, isCommentOwner),
        followUser: isAuthenticated,
        unfollowUser: isAuthenticated,
        updateProfile: isAuthenticated,
    },
}, {
    allowExternalErrors: true,
    fallbackError: 'Not authorized',
});
//# sourceMappingURL=index.js.map