import { userResolvers } from './user';
import { postResolvers } from './post';
import { authResolvers } from './auth';
import { commentResolvers } from './comment';
import { likeResolvers } from './like';
import { GraphQLDateTime } from 'graphql-scalars';

export const resolvers = {
  // Custom scalars
  DateTime: GraphQLDateTime,
  
  // Merge all resolvers
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...likeResolvers.Mutation,
  },
  User: userResolvers.User,
  Post: postResolvers.Post,
  Comment: commentResolvers.Comment,
  Like: likeResolvers.Like,
};
