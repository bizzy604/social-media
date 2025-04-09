import { gql } from 'graphql-tag';

export const postTypeDefs = gql`
  type Post {
    id: ID!
    content: String!
    author: User!
    likes: [Like!]
    comments: [Comment!]
    createdAt: DateTime!
    updatedAt: DateTime!
    liked: Boolean
    _count: PostCount
  }

  type PostCount {
    likes: Int!
    comments: Int!
  }

  extend type Query {
    post(id: ID!): Post
    feed(first: Int, skip: Int): [Post!]!
    userPosts(userId: ID!, first: Int, skip: Int): [Post!]!
  }

  extend type Mutation {
    createPost(content: String!): Post!
    updatePost(id: ID!, content: String!): Post!
    deletePost(id: ID!): Boolean!
  }
`;
