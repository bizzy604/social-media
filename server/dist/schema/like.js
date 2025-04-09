"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.likeTypeDefs = (0, graphql_tag_1.gql) `
  type Like {
    id: ID!
    user: User!
    post: Post!
    createdAt: DateTime!
  }

  extend type Mutation {
    likePost(postId: ID!): Like!
    unlikePost(postId: ID!): Boolean!
  }
`;
//# sourceMappingURL=like.js.map