"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
const user_1 = require("./user");
const post_1 = require("./post");
const auth_1 = require("./auth");
const comment_1 = require("./comment");
const like_1 = require("./like");
// Base schema with common scalars and types
const baseTypeDefs = (0, graphql_tag_1.gql) `
  scalar DateTime
  
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
`;
// Combine all type definitions
exports.typeDefs = [
    baseTypeDefs,
    user_1.userTypeDefs,
    post_1.postTypeDefs,
    auth_1.authTypeDefs,
    comment_1.commentTypeDefs,
    like_1.likeTypeDefs,
];
//# sourceMappingURL=index.js.map