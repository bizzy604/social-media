import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_SUGGESTIONS } from '../graphql/queries/user';
import { FOLLOW_USER, UNFOLLOW_USER } from '../graphql/mutations/user';
import Layout from '../components/layout/Layout';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type User = {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
  isFollowed?: boolean;
};

export default function Explore() {
  const { isAuthenticated } = useAuth();
  const [followingInProgress, setFollowingInProgress] = useState<string[]>([]);

  const { loading, error, data, refetch } = useQuery(GET_USER_SUGGESTIONS, {
    variables: { first: 20 },
    skip: !isAuthenticated,
    fetchPolicy: 'network-only',
  });

  const [followUser] = useMutation(FOLLOW_USER, {
    onCompleted: () => {
      refetch();
    },
    update: (cache, { data }, { variables }) => {
      if (data?.followUser && variables?.userId) {
        // Update the cache for user suggestions
        const suggestions = cache.readQuery({
          query: GET_USER_SUGGESTIONS,
          variables: { first: 20 },
        }) as { userSuggestions: User[] } | null;

        if (suggestions?.userSuggestions) {
          const updatedSuggestions = suggestions.userSuggestions.map(suggestion => 
            suggestion.id === variables.userId ? { ...suggestion, isFollowed: true } : suggestion
          );
          
          cache.writeQuery({
            query: GET_USER_SUGGESTIONS,
            variables: { first: 20 },
            data: { userSuggestions: updatedSuggestions },
          });
        }
      }
    },
  });

  const [unfollowUser] = useMutation(UNFOLLOW_USER, {
    onCompleted: () => {
      refetch();
    },
    update: (cache, { data }, { variables }) => {
      if (data?.unfollowUser && variables?.userId) {
        // Update the cache for user suggestions
        const suggestions = cache.readQuery({
          query: GET_USER_SUGGESTIONS,
          variables: { first: 20 },
        }) as { userSuggestions: User[] } | null;

        if (suggestions?.userSuggestions) {
          const updatedSuggestions = suggestions.userSuggestions.map(suggestion => 
            suggestion.id === variables.userId ? { ...suggestion, isFollowed: false } : suggestion
          );
          
          cache.writeQuery({
            query: GET_USER_SUGGESTIONS,
            variables: { first: 20 },
            data: { userSuggestions: updatedSuggestions },
          });
        }
      }
    },
  });

  const handleFollowToggle = async (userId: string, isFollowed: boolean) => {
    setFollowingInProgress((prev) => [...prev, userId]);
    try {
      if (isFollowed) {
        await unfollowUser({ 
          variables: { userId },
          optimisticResponse: {
            unfollowUser: true
          }
        });
      } else {
        await followUser({ 
          variables: { userId },
          optimisticResponse: {
            followUser: true
          }
        });
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
    } finally {
      setFollowingInProgress((prev) => prev.filter((id) => id !== userId));
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl p-4">
          <div className="rounded-lg bg-white p-8 shadow-md border border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Discover People on Bizzy</h2>
            <p className="text-gray-600 mb-6">Sign in to see suggested users and connect with them.</p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors duration-200"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Explore</h1>
          <p className="text-gray-600">Discover people to follow</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-6 text-center border border-red-100">
            <p className="text-red-500">Error loading suggestions: {error?.message || 'Unknown error'}</p>
          </div>
        ) : data?.userSuggestions?.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow-md border border-gray-100">
            <p className="text-gray-500">No user suggestions available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.userSuggestions.map((user: User) => (
              <div key={user.id} className="rounded-lg bg-white p-4 shadow-md border border-gray-100 flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mb-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-indigo-800 font-bold text-2xl">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <Link to={`/profile/${user.username}`} className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors duration-200">
                  {user.name || user.username}
                </Link>
                <p className="text-gray-500 text-sm mb-4">@{user.username}</p>
                <button
                  onClick={() => handleFollowToggle(user.id, user.isFollowed || false)}
                  disabled={followingInProgress.includes(user.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${user.isFollowed
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    } disabled:opacity-50`}
                >
                  {followingInProgress.includes(user.id)
                    ? 'Processing...'
                    : user.isFollowed
                      ? 'Unfollow'
                      : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
