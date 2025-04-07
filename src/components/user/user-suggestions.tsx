import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { UserItem } from "./user-item"
import type { User } from "../../lib/types"

interface UserSuggestionsProps {
  users: User[]
}

export function UserSuggestions({ users }: UserSuggestionsProps) {
  if (users.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Users</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {users.map((user) => (
            <UserItem key={user.id} user={user} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

