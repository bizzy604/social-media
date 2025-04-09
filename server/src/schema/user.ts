import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    name: String
    bio: String
    avatar: String
    followers: [User!]
    following: [User!]
    posts: [Post!]
    createdAt: DateTime!
    updatedAt: DateTime!
    _count: UserCount
  }

  type UserCount {
    followers: Int!
    following: Int!
    posts: Int!
  }

  input UpdateProfileInput {
    name: String
    bio: String
    avatar: String
  }

  extend type Query {
    me: User
    user(id: ID, username: String): User
    users(query: String, first: Int, skip: Int): [User!]!
    userSuggestions(first: Int): [User!]!
  }

  extend type Mutation {
    followUser(userId: ID!): Boolean!
    unfollowUser(userId: ID!): Boolean!
    updateProfile(input: UpdateProfileInput!): User!
  }
`;
