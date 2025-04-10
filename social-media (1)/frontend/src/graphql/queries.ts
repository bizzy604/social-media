import { gql } from "@apollo/client"

export const GET_FEED = gql`
  query GetFeed {
    feed {
      id
      content
      createdAt
      isLiked
      _count {
        likes
      }
      author {
        id
        name
        username
        image
      }
    }
  }
`

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      username
      image
      bio
      isFollowing
      _count {
        posts
        followers
        following
      }
    }
  }
`

export const GET_USER_POSTS = gql`
  query GetUserPosts($userId: ID!) {
    userPosts(userId: $userId) {
      id
      content
      createdAt
      isLiked
      _count {
        likes
      }
      author {
        id
        name
        username
        image
      }
    }
  }
`

export const GET_USERS_TO_FOLLOW = gql`
  query GetUsersToFollow($limit: Int) {
    usersToFollow(limit: $limit) {
      id
      name
      username
      image
      bio
      _count {
        posts
        followers
        following
      }
    }
  }
`

export const GET_FOLLOWERS = gql`
  query GetFollowers($userId: ID!) {
    followers(userId: $userId) {
      id
      name
      username
      image
      bio
      isFollowing
      _count {
        posts
        followers
        following
      }
    }
  }
`

export const GET_FOLLOWING = gql`
  query GetFollowing($userId: ID!) {
    following(userId: $userId) {
      id
      name
      username
      image
      bio
      isFollowing
      _count {
        posts
        followers
        following
      }
    }
  }
`
