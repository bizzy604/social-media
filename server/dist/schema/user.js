"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.userTypeDefs = (0, graphql_tag_1.gql) `
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
//# sourceMappingURL=user.js.map