import { gql } from '@apollo/client';

export const CREATE_POST = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
      author {
        id
        username
        avatar
      }
      _count {
        likes
        comments
      }
      liked
      createdAt
    }
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      post {
        id
      }
      user {
        id
      }
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId)
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($postId: ID!, $content: String!) {
    createComment(postId: $postId, content: $content) {
      id
      content
      author {
        id
        username
        avatar
      }
      post {
        id
      }
      createdAt
    }
  }
`;
