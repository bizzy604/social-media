import { gql } from 'graphql-tag';

export const likeTypeDefs = gql`
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
