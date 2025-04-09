"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.commentTypeDefs = (0, graphql_tag_1.gql) `
  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  extend type Mutation {
    createComment(postId: ID!, content: String!): Comment!
    updateComment(id: ID!, content: String!): Comment!
    deleteComment(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=comment.js.map