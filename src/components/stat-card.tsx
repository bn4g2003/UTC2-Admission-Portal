import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "../../lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  iconColor?: string
  children?: ReactNode
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon,
  iconColor = "bg-blue-100 text-blue-600",
  children,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {icon && <div className={`p-2 rounded-lg ${iconColor}`}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {children}
      </CardContent>
    </Card>
  )
}
