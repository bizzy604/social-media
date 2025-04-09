import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { GET_POST } from '../graphql/queries/post';
import { CREATE_COMMENT, LIKE_POST, UNLIKE_POST } from '../graphql/mutations/post';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

type Comment = {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
};

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const { user, isAuthenticated } = useAuth();
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_POST, {
    variables: { id: postId },
    skip: !postId,
  });

  const [createComment] = useMutation(CREATE_COMMENT);
  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !postId) return;

    setSubmitting(true);
    try {
      await createComment({
        variables: { postId, content: commentContent },
        update: (cache, { data: { createComment } }) => {
          // Update the post in the cache to include the new comment
          const existingPost = cache.readQuery({
            query: GET_POST,
            variables: { id: postId },
          }) as { post: any } | null;

          if (existingPost && existingPost.post) {
            cache.writeQuery({
              query: GET_POST,
              variables: { id: postId },
              data: {
                post: {
                  ...existingPost.post,
                  comments: [createComment, ...existingPost.post.comments],
                  _count: {
                    ...existingPost.post._count,
                    comments: existingPost.post._count.comments + 1,
                  },
                },
              },
            });
          }
        },
      });
      setCommentContent('');
      refetch();
    } catch (err) {
      console.error('Error creating comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!data?.post || isLikeProcessing) return;
    
    try {
      setIsLikeProcessing(true);
      
      if (data.post.liked) {
        await unlikePost({
          variables: { postId },
          optimisticResponse: {
            __typename: 'Mutation',
            unlikePost: true,
          },
          update: (cache) => {
            const existingPost = cache.readQuery({
              query: GET_POST,
              variables: { id: postId },
            }) as { post: any } | null;

            if (existingPost && existingPost.post) {
              cache.writeQuery({
                query: GET_POST,
                variables: { id: postId },
                data: {
                  post: {
                    ...existingPost.post,
                    liked: false,
                    _count: {
                      ...existingPost.post._count,
                      likes: Math.max(0, existingPost.post._count.likes - 1),
                    },
                  },
                },
              });
            }
          },
        });
      } else {
        await likePost({
          variables: { postId },
          update: (cache) => {
            const existingPost = cache.readQuery({
              query: GET_POST,
              variables: { id: postId },
            }) as { post: any } | null;

            if (existingPost && existingPost.post) {
              cache.writeQuery({
                query: GET_POST,
                variables: { id: postId },
                data: {
                  post: {
                    ...existingPost.post,
                    liked: true,
                    _count: {
                      ...existingPost.post._count,
                      likes: existingPost.post._count.likes + 1,
                    },
                  },
                },
              });
            }
          },
        });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setTimeout(() => {
        setIsLikeProcessing(false);
      }, 500);
    }
  };

  if (loading) return <Layout><div className="text-center p-8">Loading post...</div></Layout>;
  if (error) return <Layout><div className="text-center p-8 text-red-500">Error loading post: {error.message}</div></Layout>;
  if (!data?.post) return <Layout><div className="text-center p-8">Post not found</div></Layout>;

  const { post } = data;

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Post Header */}
          <div className="flex items-start space-x-3 mb-4">
            <Link to={`/profile/${post.author.username}`} className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                {post.author.avatar ? (
                  <img src={post.author.avatar} alt={post.author.username} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-indigo-600 font-medium">
                    {post.author.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
            <div>
              <Link 
                to={`/profile/${post.author.username}`} 
                className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
              >
                {post.author.name || post.author.username}
              </Link>
              <p className="text-xs text-gray-500">
                @{post.author.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {/* Post Content */}
          <p className="text-gray-800 whitespace-pre-wrap break-words mb-4">{post.content}</p>
          
          {/* Post Actions */}
          <div className="flex items-center space-x-4 text-sm border-t pt-4">
            <button 
              onClick={handleLikeToggle}
              disabled={!isAuthenticated || isLikeProcessing}
              className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${post.liked ? 'text-red-500 fill-current' : 'text-gray-400'}`}
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
            <div className="flex items-center space-x-1 text-gray-500">
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
            </div>
          </div>
        </div>
        
        {/* Comment Form */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <form onSubmit={handleCreateComment}>
              <div className="mb-3">
                <textarea
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !commentContent.trim()}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Comments List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Comments</h2>
          
          {post.comments.length === 0 ? (
            <div className="bg-white rounded-lg p-4 text-center text-gray-500 shadow-md">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            post.comments.map((comment: Comment) => (
              <div key={comment.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <Link to={`/profile/${comment.author.username}`} className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                      {comment.author.avatar ? (
                        <img src={comment.author.avatar} alt={comment.author.username} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-indigo-600 font-medium text-sm">
                          {comment.author.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/profile/${comment.author.username}`} 
                        className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {comment.author.username}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-800">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
