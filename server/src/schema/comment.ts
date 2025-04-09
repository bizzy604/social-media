import { gql } from 'graphql-tag';

export const commentTypeDefs = gql`
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
