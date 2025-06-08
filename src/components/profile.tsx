"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  Check,
  X,
} from "lucide-react"
import { useRouter } from "next/router"

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone_number: string
  address: string
  date_of_birth: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState<Partial<UserProfile>>({})

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/users/profile", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Không thể tải thông tin cá nhân")
        }

        const data = await response.json()
        setProfile(data)
        setFormData(data)
      } catch (err) {
        setError("Không thể tải thông tin cá nhân")
        console.error("Error fetching profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          address: formData.address,
          date_of_birth: formData.date_of_birth,
        }),
      })

      if (!response.ok) {
        throw new Error("Không thể cập nhật thông tin")
      }

      const data = await response.json()
      setProfile(data)
      setIsEditing(false)
      setSuccess("Cập nhật thông tin thành công!")
    } catch (err) {
      setError("Không thể cập nhật thông tin")
      console.error("Error updating profile:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className=" w-[400px] sm:w-[540px] bg-background">
      <div className="flex-1">
        <div className="container mx-auto py-10">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Xem và cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
                  <AlertDescription className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {success}
                  </AlertDescription>
                </Alert>
              )}              {/* Display Mode */}
              {!isEditing ? (
                <div className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profile?.email}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="full_name"
                        value={profile?.full_name}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone_number"
                        value={profile?.phone_number}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={profile?.address}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Ngày sinh</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={profile?.date_of_birth}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setIsEditing(true)}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                </div>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleUpdate} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profile?.email}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) =>
                          setFormData({ ...formData, phone_number: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Ngày sinh</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) =>
                          setFormData({ ...formData, date_of_birth: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button type="submit" className="flex-1">
                      Lưu thay đổi
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData(profile || {})
                        setError("")
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}