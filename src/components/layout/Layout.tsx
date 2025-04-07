import { Outlet } from "react-router-dom"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto flex">
        <Sidebar />
        <main className="flex-1 px-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

