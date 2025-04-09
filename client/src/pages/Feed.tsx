import React, { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FEED } from '../graphql/queries/post';
import { CREATE_POST, LIKE_POST, UNLIKE_POST } from '../graphql/mutations/post';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

type Post = {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: string;
  liked: boolean;
};

export default function Feed() {
  const { user, isAuthenticated } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_FEED);
  const [createPost] = useMutation(CREATE_POST);
  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setSubmitting(true);
    try {
      await createPost({
        variables: { content: postContent },
        update: (cache, { data: { createPost } }) => {
          // Update cache after creating a post
          const existingFeed = cache.readQuery({
            query: GET_FEED,
          }) as { feed: Post[] } | null;

          if (existingFeed) {
            cache.writeQuery({
              query: GET_FEED,
              data: {
                feed: [createPost, ...existingFeed.feed],
              },
            });
          }
        },
      });
      setPostContent('');
      refetch();
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Track posts that are currently being processed to prevent multiple clicks
  const [processingLikes, setProcessingLikes] = useState<Record<string, boolean>>({});
  
  const handleLikeToggle = async (postId: string, liked: boolean) => {
    // Prevent rapid clicking on the same post
    if (processingLikes[postId]) return;
    
    try {
      // Mark this post as being processed
      setProcessingLikes(prev => ({ ...prev, [postId]: true }));
      
      if (liked) {
        await unlikePost({
          variables: { postId },
          optimisticResponse: {
            __typename: 'Mutation',
            unlikePost: true,
          },
          update: (cache) => {
            // Update the post in the cache
            const existingFeed = cache.readQuery({
              query: GET_FEED,
            }) as { feed: Post[] } | null;

            if (existingFeed) {
              const updatedFeed = existingFeed.feed.map((post) => {
                if (post.id === postId) {
                  return {
                    ...post,
                    liked: false,
                    _count: {
                      ...post._count,
                      // Ensure count doesn't go below 0
                      likes: Math.max(0, post._count.likes - 1),
                      comments: post._count.comments
                    },
                  };
                }
                return post;
              });

              cache.writeQuery({
                query: GET_FEED,
                data: { feed: updatedFeed },
              });
            }
          },
        });
      } else {
        await likePost({
          variables: { postId },
          optimisticResponse: {
            __typename: 'Mutation',
            likePost: {
              __typename: 'Like',
              id: 'temp-id',
              post: { __typename: 'Post', id: postId },
              user: { __typename: 'User', id: user?.id || '' },
            },
          },
          update: (cache) => {
            // Update the post in the cache
            const existingFeed = cache.readQuery({
              query: GET_FEED,
            }) as { feed: Post[] } | null;

            if (existingFeed) {
              const updatedFeed = existingFeed.feed.map((post) => {
                if (post.id === postId) {
                  return {
                    ...post,
                    liked: true,
                    _count: {
                      ...post._count,
                      likes: post._count.likes + 1,
                      comments: post._count.comments
                    },
                  };
                }
                return post;
              });

              cache.writeQuery({
                query: GET_FEED,
                data: { feed: updatedFeed },
              });
            }
          },
        });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      // After operation completes (success or failure), remove from processing state
      setTimeout(() => {
        setProcessingLikes(prev => {
          const newState = { ...prev };
          delete newState[postId];
          return newState;
        });
      }, 500); // Add a small delay to prevent rapid clicking
    }
  };

  if (loading) return <Layout><div className="text-center p-8">Loading...</div></Layout>;
  if (error) return <Layout><div className="text-center p-8 text-red-500">Error loading feed: {String(error)}</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl p-4">
        {isAuthenticated && (
          <div className="mb-6 rounded-lg bg-white p-4 shadow">
            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <textarea
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !postContent.trim()}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
        {data?.feed.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow">
            <p className="text-gray-500">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          data?.feed.map((post: Post) => (
            <div key={post.id} className="rounded-lg bg-white p-4 shadow">
              <div className="mb-2 flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.username}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <span className="text-indigo-800 font-bold">
                      {post.author.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="ml-3">
                  <Link to={`/profile/${post.author.username}`} className="font-medium text-gray-900 hover:underline">
                    {post.author.username}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-gray-800">{post.content}</p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <button 
                  className="flex items-center space-x-1"
                  onClick={() => handleLikeToggle(post.id, post.liked)}
                  disabled={!isAuthenticated}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${post.liked ? 'text-red-500' : 'text-gray-400'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{post._count.likes} likes</span>
                </button>
                <Link to={`/post/${post.id}`} className="flex items-center space-x-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{post._count.comments} comments</span>
                </Link>
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </Layout>
  );
}
