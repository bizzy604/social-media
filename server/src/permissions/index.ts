import { shield, rule, allow, and } from 'graphql-shield';
import { Context } from '../context';

// Rule to check if a user is authenticated
const isAuthenticated = rule({ cache: 'contextual' })(async (_: any, __: any, { userId }: Context) => {
  return userId !== null ? true : new Error('Not authenticated');
});

// Rule to check if a user owns a post
const isPostOwner = rule({ cache: 'contextual' })(async (
  _: any,
  { id }: { id: string },
  { prisma, userId }: Context
) => {
  if (!userId) return new Error('Not authenticated');
  
  const post = await prisma.post.findUnique({ where: { id } });
  return post?.authorId === userId ? true : new Error('Not authorized');
});

// Rule to check if a user owns a comment
const isCommentOwner = rule({ cache: 'contextual' })(async (
  _: any,
  { id }: { id: string },
  { prisma, userId }: Context
) => {
  if (!userId) return new Error('Not authenticated');
  
  const comment = await prisma.comment.findUnique({ where: { id } });
  return comment?.authorId === userId ? true : new Error('Not authorized');
});

// Define permissions for each type and field
export const permissions = shield(
  {
    Query: {
      me: isAuthenticated,
      feed: isAuthenticated,
      userPosts: allow,
      post: allow,
      user: allow,
      users: allow,
      userSuggestions: isAuthenticated,
    },
    Mutation: {
      register: allow,
      login: allow,
      createPost: isAuthenticated,
      updatePost: and(isAuthenticated, isPostOwner),
      deletePost: and(isAuthenticated, isPostOwner),
      likePost: isAuthenticated,
      unlikePost: isAuthenticated,
      createComment: isAuthenticated,
      updateComment: and(isAuthenticated, isCommentOwner),
      deleteComment: and(isAuthenticated, isCommentOwner),
      followUser: isAuthenticated,
      unfollowUser: isAuthenticated,
      updateProfile: isAuthenticated,
    },
  },
  {
    allowExternalErrors: true,
    fallbackError: 'Not authorized',
  }
);
