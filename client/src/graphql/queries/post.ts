import { gql } from '@apollo/client';

export const GET_FEED = gql`
  query Feed($first: Int, $skip: Int) {
    feed(first: $first, skip: $skip) {
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

export const GET_POST = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id
      content
      createdAt
      author {
        id
        username
        name
        avatar
      }
      comments {
        id
        content
        createdAt
        author {
          id
          username
          name
          avatar
        }
      }
      _count {
        likes
        comments
      }
      liked
    }
  }
`;
