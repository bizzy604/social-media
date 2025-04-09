import React, { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FEED } from '../graphql/queries/post';
import { CREATE_POST, LIKE_POST, UNLIKE_POST } from '../graphql/mutations/post';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import PostCard from '../components/post/PostCard';

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
  liked: boolean;
  createdAt: string;
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_FEED);
  const [createPost] = useMutation(CREATE_POST);

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

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error loading feed: {String(error)}</div>;

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-4">
        {isAuthenticated && (
          <div className="mb-6 rounded-lg bg-white p-5 shadow-md border border-gray-100">
            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <textarea
                  className="w-full rounded-md border border-gray-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
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
                  className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 transition-colors duration-200"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-6 text-center border border-red-100">
              <p className="text-red-500">Error loading feed: {String(error)}</p>
            </div>
          ) : data?.feed.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center shadow-md border border-gray-100">
              <p className="text-gray-500">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.feed.map((post: Post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  content={post.content}
                  author={post.author}
                  createdAt={post.createdAt}
                  _count={post._count}
                  liked={post.liked}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
