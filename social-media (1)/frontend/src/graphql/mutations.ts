import { gql } from "@apollo/client"

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        username
        image
      }
    }
  }
`

export const REGISTER_USER = gql`
  mutation RegisterUser($name: String!, $username: String!, $email: String!, $password: String!) {
    register(name: $name, username: $username, email: $email, password: $password) {
      token
      user {
        id
        name
        username
        email
      }
    }
  }
`

export const CREATE_POST = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
      createdAt
      author {
        id
        name
        username
        image
      }
    }
  }
`

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      postId
    }
  }
`

export const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId)
  }
`

export const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      id
      followingId
    }
  }
`

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId)
  }
`
