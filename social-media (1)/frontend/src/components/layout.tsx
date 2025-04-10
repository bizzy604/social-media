import { Outlet } from "react-router-dom"
import Header from "./header"

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
