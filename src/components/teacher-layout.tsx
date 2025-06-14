import type { ReactNode } from "react"
import { TeacherSidebar } from "./teacher-sidebar"

interface TeacherLayoutProps {
  children: ReactNode
  unreadNotifications?: number
  activeRoute?: string
}

export function TeacherLayout({ children, unreadNotifications = 0, activeRoute = "" }: TeacherLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSidebar unreadNotifications={unreadNotifications} activeRoute={activeRoute} />
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
