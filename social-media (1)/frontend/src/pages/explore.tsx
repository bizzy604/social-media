import { useQuery } from "@apollo/client"
import { GET_USERS_TO_FOLLOW } from "../graphql/queries"
import { UserCard } from "../components"
import { Skeleton } from "../components/ui/skeleton"
import { Card } from "../components/ui/card"

export default function ExplorePage() {
  const { loading, error, data, refetch } = useQuery(GET_USERS_TO_FOLLOW)

  if (loading) {
    return (
      <main className="container max-w-4xl mx-auto py-4 px-4 md:px-0">
        <h1 className="text-2xl font-bold mb-6">Explore</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container max-w-4xl mx-auto py-4 px-4 md:px-0">
        <h1 className="text-2xl font-bold mb-6">Explore</h1>
        <div className="text-center py-10 text-red-500">Error loading users: {error.message}</div>
      </main>
    )
  }

  const users = data?.usersToFollow || []

  return (
    <main className="container max-w-4xl mx-auto py-4 px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>

      {users.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No more users to follow at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {users.map((user: any) => (
            <UserCard
              key={user.id}
              user={{
                id: user.id,
                name: user.name || "",
                username: user.username || "",
                email: user.email,
                image: user.image,
                bio: user.bio,
                followersCount: user._count.followers,
                followingCount: user._count.following,
                postsCount: user._count.posts,
                isFollowing: false,
              }}
              onFollowToggled={() => refetch()}
            />
          ))}
        </div>
      )}
    </main>
  )
}
