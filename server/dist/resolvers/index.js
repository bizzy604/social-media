"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const user_1 = require("./user");
const post_1 = require("./post");
const auth_1 = require("./auth");
const comment_1 = require("./comment");
const like_1 = require("./like");
const graphql_scalars_1 = require("graphql-scalars");
exports.resolvers = {
    // Custom scalars
    DateTime: graphql_scalars_1.GraphQLDateTime,
    // Merge all resolvers
    Query: {
        ...user_1.userResolvers.Query,
        ...post_1.postResolvers.Query,
    },
    Mutation: {
        ...auth_1.authResolvers.Mutation,
        ...user_1.userResolvers.Mutation,
        ...post_1.postResolvers.Mutation,
        ...comment_1.commentResolvers.Mutation,
        ...like_1.likeResolvers.Mutation,
    },
    User: user_1.userResolvers.User,
    Post: post_1.postResolvers.Post,
    Comment: comment_1.commentResolvers.Comment,
    Like: like_1.likeResolvers.Like,
};
//# sourceMappingURL=index.js.map