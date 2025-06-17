import type { ReactNode } from "react"
import { TeacherSidebar, useTeacherSidebar } from "./teacher-sidebar"

interface TeacherLayoutProps {
  children: ReactNode
  unreadNotifications?: number
  activeRoute?: string
}

export function TeacherLayout({ children, unreadNotifications = 0, activeRoute = "" }: TeacherLayoutProps) {
  const { isOpen, toggleSidebar } = useTeacherSidebar()

  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSidebar 
        unreadNotifications={unreadNotifications} 
        activeRoute={activeRoute}
        isOpen={isOpen}
        onToggle={toggleSidebar}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top spacing for mobile menu button */}
        <div className="md:hidden h-16" />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
