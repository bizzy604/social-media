import { gql } from '@apollo/client';

export const GET_ME = gql`
  query Me {
    me {
      id
      username
      email
      name
      bio
      avatar
      createdAt
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query UserProfile($username: String!) {
    user(username: $username) {
      id
      username
      name
      bio
      avatar
      createdAt
      _count {
        followers
        following
      }
      isFollowed
    }
  }
`;

export const GET_USER_POSTS = gql`
  query UserPosts($userId: ID!, $first: Int, $skip: Int) {
    userPosts(userId: $userId, first: $first, skip: $skip) {
      id
      content
      createdAt
      author {
        id
        username
        name
        avatar
      }
      _count {
        likes
        comments
      }
      liked
    }
  }
`;

export const GET_USER_SUGGESTIONS = gql`
  query UserSuggestions($first: Int) {
    userSuggestions(first: $first) {
      id
      username
      name
      avatar
    }
  }
`;
