"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, MapPin, Search, Clock } from "lucide-react"

declare global {
  interface Window {
    trends: any
  }
}

export default function GoogleTrendsCharts() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://ssl.gstatic.com/trends_nrtr/4031_RC01/embed_loader.js"
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      setIsLoading(false)
      // @ts-ignore
      if (typeof window.trends !== "undefined") {
        const commonOptions = {
          width: "100%",
          height: 300,
        }

        const widgets = [
          {
            id: "widget1",
            type: "TIMESERIES",
            keyword: "đại học",
            geo: "VN",
            time: "today 3-m",
            category: 958,
            query: "cat=958&date=today%203-m&geo=VN&q=đại%20học&hl=vi",
          },
          {
            id: "widget2",
            type: "GEO_MAP",
            keyword: "đại học",
            geo: "VN",
            time: "today 3-m",
            category: 958,
            query: "cat=958&date=today%203-m&geo=VN&q=đại%20học&hl=vi",
          },
          {
            id: "widget3",
            type: "RELATED_QUERIES",
            keyword: "đại học",
            geo: "VN",
            time: "today 3-m",
            category: 958,
            query: "cat=958&date=today%203-m&geo=VN&q=đại%20học&hl=vi",
          },
          {
            id: "widget4",
            type: "TIMESERIES",
            keyword: "utc2",
            geo: "VN",
            time: "today 3-m",
            category: 0,
            query: "date=today%203-m&geo=VN&q=utc2&hl=vi",
          },
          {
            id: "widget5",
            type: "GEO_MAP",
            keyword: "utc2",
            geo: "VN",
            time: "today 3-m",
            category: 0,
            query: "date=today%203-m&geo=VN&q=utc2&hl=vi",
          },
          {
            id: "widget6",
            type: "RELATED_QUERIES",
            keyword: "utc2",
            geo: "VN",
            time: "today 3-m",
            category: 0,
            query: "date=today%203-m&geo=VN&q=utc2&hl=vi",
          },
        ]

        // Delay rendering to ensure DOM is ready
        setTimeout(() => {
          widgets.forEach((widget) => {
            const container = document.getElementById(widget.id)
            if (container) {
              // @ts-ignore
              window.trends.embed.renderExploreWidgetTo(
                container,
                widget.type,
                {
                  comparisonItem: [{ keyword: widget.keyword, geo: widget.geo, time: widget.time }],
                  category: widget.category,
                  property: "",
                },
                {
                  ...commonOptions,
                  exploreQuery: widget.query,
                  guestPath: "https://trends.google.com:443/trends/embed/",
                },
              )
            }
          })
        }, 500)
      }
    }

    script.onerror = () => {
      setIsLoading(false)
      console.error("Failed to load Google Trends script")
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="university" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="university" className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4" />
            <span>Xu hướng "Đại học"</span>
          </TabsTrigger>
          <TabsTrigger value="utc2" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Xu hướng "UTC2"</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="university" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Mức độ quan tâm theo thời gian</span>
                  <Badge variant="secondary">3 tháng qua</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="widget1" className="w-full h-[300px] overflow-hidden rounded-lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>Phân bố theo khu vực</span>
                  <Badge variant="secondary">Việt Nam</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="widget2" className="w-full h-[300px] overflow-hidden rounded-lg" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-purple-600" />
                <span>Truy vấn liên quan</span>
                <Badge variant="outline">Từ khóa phổ biến</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div id="widget3" className="w-full h-[400px] overflow-hidden rounded-lg" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utc2" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Mức độ quan tâm theo thời gian</span>
                  <Badge variant="secondary">3 tháng qua</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="widget4" className="w-full h-[300px] overflow-hidden rounded-lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>Phân bố theo khu vực</span>
                  <Badge variant="secondary">Việt Nam</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="widget5" className="w-full h-[300px] overflow-hidden rounded-lg" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-purple-600" />
                <span>Truy vấn liên quan</span>
                <Badge variant="outline">Từ khóa phổ biến</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div id="widget6" className="w-full h-[400px] overflow-hidden rounded-lg" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Tóm tắt xu hướng</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">📈 Xu hướng "Đại học":</h4>
              <ul className="space-y-1 text-xs">
                <li>• Mức độ quan tâm cao nhất vào tháng 6-8 (mùa tuyển sinh)</li>
                <li>• Khu vực tìm kiếm nhiều: TP.HCM, Hà Nội, Đà Nẵng</li>
                <li>• Từ khóa liên quan: điểm chuẩn, xét tuyển, ngành học</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Xu hướng "UTC2":</h4>
              <ul className="space-y-1 text-xs">
                <li>• Tăng trưởng ổn định trong 3 tháng qua</li>
                <li>• Tập trung chủ yếu tại TP.HCM và các tỉnh lân cận</li>
                <li>• Quan tâm cao về thông tin tuyển sinh và chương trình đào tạo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GraduationCap({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
    </svg>
  )
}
