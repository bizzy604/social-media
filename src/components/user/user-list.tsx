import { UserItem } from "./user-item"
import type { User } from "../../lib/types"

interface UserListProps {
  users: User[]
}

export function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-center text-muted-foreground">No users found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <UserItem key={user.id} user={user} />
      ))}
    </div>
  )
}

