import { useQuery } from "@apollo/client"
import { GET_FEED } from "../graphql/queries"
import { PostCard, CreatePostForm, FeedSkeleton } from "../components"

export default function HomePage() {
  const { loading, error, data, refetch } = useQuery(GET_FEED)

  if (loading) return <FeedSkeleton />

  if (error) {
    console.error('Feed query error:', error);
    return (
      <main className="container max-w-4xl mx-auto py-4 px-4 md:px-0">
        <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error loading feed</h3>
          <p className="text-red-600 mb-2">{error.message}</p>
          <p className="text-sm text-gray-600">
            This might be because the GraphQL server is not running or there's a connection issue.
            Please make sure the server is running on port 4000.
          </p>
        </div>
        <CreatePostForm onPostCreated={() => refetch()} />
      </main>
    );
  }

  const posts = data?.feed || []

  return (
    <main className="container max-w-4xl mx-auto py-4 px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
      <div className="space-y-6">
        <CreatePostForm onPostCreated={() => refetch()} />

        {posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Your feed is empty. Follow some users to see their posts here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  content: post.content,
                  createdAt: new Date(post.createdAt),
                  author: post.author,
                  likeCount: post._count.likes,
                  isLiked: post.isLiked,
                }}
                onLikeToggled={() => refetch()}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
