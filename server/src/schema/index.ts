import { gql } from 'graphql-tag';
import { userTypeDefs } from './user';
import { postTypeDefs } from './post';
import { authTypeDefs } from './auth';
import { commentTypeDefs } from './comment';
import { likeTypeDefs } from './like';

// Base schema with common scalars and types
const baseTypeDefs = gql`
  scalar DateTime
  
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
`;

// Combine all type definitions
export const typeDefs = [
  baseTypeDefs,
  userTypeDefs,
  postTypeDefs,
  authTypeDefs,
  commentTypeDefs,
  likeTypeDefs,
];
