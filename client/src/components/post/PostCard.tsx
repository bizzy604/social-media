import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { LIKE_POST, UNLIKE_POST } from '../../graphql/mutations/post';
import { GET_FEED } from '../../graphql/queries/post';

interface Author {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
}

interface PostCardProps {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
  };
  liked: boolean;
}

export default function PostCard({ id, content, author, createdAt, _count, liked }: PostCardProps) {
  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLikeToggle = async () => {
    // Prevent rapid clicking
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      if (liked) {
        await unlikePost({
          variables: { postId: id },
          update: (cache) => {
            const existingFeed = cache.readQuery({
              query: GET_FEED,
            }) as { feed: any[] } | null;

            if (existingFeed) {
              const updatedFeed = existingFeed.feed.map((post) => {
                if (post.id === id) {
                  return {
                    ...post,
                    liked: false,
                    _count: {
                      ...post._count,
                      // Ensure count doesn't go below 0
                      likes: Math.max(0, post._count.likes - 1),
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
          variables: { postId: id },
          update: (cache) => {
            const existingFeed = cache.readQuery({
              query: GET_FEED,
            }) as { feed: any[] } | null;

            if (existingFeed) {
              const updatedFeed = existingFeed.feed.map((post) => {
                if (post.id === id) {
                  return {
                    ...post,
                    liked: true,
                    _count: {
                      ...post._count,
                      likes: post._count.likes + 1,
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
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      // Add a small delay before allowing another click
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-3">
        <Link to={`/profile/${author.username}`} className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
            {author.avatar ? (
              <img src={author.avatar} alt={author.username} className="h-full w-full object-cover" />
            ) : (
              <span className="text-indigo-600 font-medium">
                {author.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                to={`/profile/${author.username}`} 
                className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
              >
                {author.name || author.username}
              </Link>
              <p className="text-xs text-gray-500">
                @{author.username} · {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <p className="mt-2 text-gray-800 whitespace-pre-wrap break-words">{content}</p>
          <div className="flex items-center space-x-4 text-sm border-t pt-4">
            <button 
              onClick={handleLikeToggle}
              className={`flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isProcessing}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${liked ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{_count.likes} likes</span>
            </button>
            <Link to={`/post/${id}`} className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors">
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
              <span>{_count.comments} comments</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
