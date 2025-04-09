import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_PROFILE, GET_USER_POSTS } from '../graphql/queries/user';
import { FOLLOW_USER, UNFOLLOW_USER } from '../graphql/mutations/user';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/post/PostCard';
import Layout from '../components/layout/Layout';

type User = {
  id: string;
  username: string;
  name?: string;
  bio?: string;
  avatar?: string;
  _count: {
    followers: number;
    following: number;
  };
  isFollowed: boolean;
};

type Post = {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    name?: string;
    avatar?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  liked: boolean;
  createdAt: string;
};

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [] = useState<'posts' | 'about'>('posts');
  const [followInProgress, setFollowInProgress] = useState(false);

  const { data: profileData, loading: profileLoading, error: profileError, refetch: refetchProfile } = useQuery(
    GET_USER_PROFILE,
    {
      variables: { username },
      skip: !username,
      onError: (error) => {
        console.error('Error fetching user profile:', error);
        console.log('Attempted to fetch profile for username:', username);
      }
    }
  );

  const { data: postsData, error: postsError } = useQuery(GET_USER_POSTS, {
    variables: { userId: profileData?.user?.id },
    skip: !profileData?.user?.id,
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching user posts:', error);
      console.log('Attempted to fetch posts for userId:', profileData?.user?.id);
    }
  });

  const [followUser] = useMutation(FOLLOW_USER, {
    onCompleted: () => {
      refetchProfile();
    },
    update: (cache) => {
      // Update the user profile in the cache to reflect the follow action
      const data = cache.readQuery({
        query: GET_USER_PROFILE,
        variables: { username },
      }) as { user: User } | null;

      if (data?.user) {
        cache.writeQuery({
          query: GET_USER_PROFILE,
          variables: { username },
          data: {
            user: {
              ...data.user,
              isFollowed: true,
              _count: {
                ...data.user._count,
                followers: data.user._count.followers + 1,
              },
            },
          },
        });
      }
    },
  });

  const [unfollowUser] = useMutation(UNFOLLOW_USER, {
    onCompleted: () => {
      refetchProfile();
    },
    update: (cache) => {
      // Update the user profile in the cache to reflect the unfollow action
      const data = cache.readQuery({
        query: GET_USER_PROFILE,
        variables: { username },
      }) as { user: User } | null;

      if (data?.user) {
        cache.writeQuery({
          query: GET_USER_PROFILE,
          variables: { username },
          data: {
            user: {
              ...data.user,
              isFollowed: false,
              _count: {
                ...data.user._count,
                followers: Math.max(0, data.user._count.followers - 1),
              },
            },
          },
        });
      }
    },
  });

  const handleFollowToggle = async () => {
    if (!profileData?.user) return;
    setFollowInProgress(true);
    try {
      if (profileData.user.isFollowed) {
        await unfollowUser({ 
          variables: { userId: profileData.user.id },
          optimisticResponse: {
            unfollowUser: true
          }
        });
      } else {
        await followUser({ 
          variables: { userId: profileData.user.id },
          optimisticResponse: {
            followUser: true
          }
        });
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
    } finally {
      setFollowInProgress(false);
    }
  };

  if (profileLoading) return <Layout><div className="text-center p-8">Loading profile...</div></Layout>;
  if (profileError) return <Layout><div className="text-center p-8 text-red-500">Error loading profile: {profileError.message}</div></Layout>;
  if (!profileData?.user) return <Layout><div className="text-center p-8">User not found: {username}</div></Layout>;
  if (postsError) return <Layout><div className="text-center p-8 text-red-500">Error loading posts: {postsError.message}</div></Layout>;


  const { user: profile } = profileData;
  const isCurrentUser = currentUser?.id === profile.id;

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl p-4">
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md border border-gray-100">
          <div className="flex flex-col items-center md:flex-row md:items-start">
            <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-indigo-800">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="mt-4 text-center md:ml-6 md:mt-0 md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name || profile.username}</h1>
              <p className="text-gray-600">@{profile.username}</p>
              {profile.bio && <p className="mt-2 text-gray-700">{profile.bio}</p>}
              
              <div className="mt-4 flex space-x-4 text-sm text-gray-600">
                <div className="cursor-pointer hover:text-indigo-600 transition-colors duration-200">
                  <span className="font-medium text-gray-900">{profile._count.followers}</span>{' '}
                  followers
                </div>
                <div className="cursor-pointer hover:text-indigo-600 transition-colors duration-200">
                  <span className="font-medium text-gray-900">{profile._count.following}</span>{' '}
                  following
                </div>
              </div>
              
              {!isCurrentUser && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followInProgress}
                  className={`mt-4 rounded-full px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    profile.isFollowed
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } disabled:opacity-50`}
                >
                  {followInProgress
                    ? 'Processing...'
                    : profile.isFollowed
                      ? 'Unfollow'
                      : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Posts</h2>
          {postsData?.userPosts.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center shadow-md border border-gray-100">
              <p className="text-gray-500">No posts yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {postsData?.userPosts.map((post: Post) => (
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
