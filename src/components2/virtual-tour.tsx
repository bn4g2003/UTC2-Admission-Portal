"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Maximize, Volume2, RotateCcw } from "lucide-react"

const tourSpots = [
  { id: 1, name: "Main Campus", image: "/placeholder.svg?height=400&width=600" },
  { id: 2, name: "Library", image: "/placeholder.svg?height=400&width=600" },
  { id: 3, name: "Labs", image: "/placeholder.svg?height=400&width=600" },
  { id: 4, name: "Dormitories", image: "/placeholder.svg?height=400&width=600" },
]

export function VirtualTour() {
  const [activeSpot, setActiveSpot] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-[#002147] mb-6 font-serif">Virtual Campus Tour</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Experience our beautiful campus from anywhere in the world with our immersive 360° virtual tour
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Tour Navigation */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#002147] mb-6">Explore Campus</h3>
            {tourSpots.map((spot, index) => (
              <Card
                key={spot.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  activeSpot === index ? "ring-2 ring-[#FFD700] bg-[#FFD700]/10" : "hover:shadow-lg"
                }`}
                onClick={() => setActiveSpot(index)}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden">
                    <img
                      src={spot.image || "/placeholder.svg"}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#002147]">{spot.name}</h4>
                    <p className="text-sm text-slate-600">360° View Available</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Virtual Tour Viewer */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-2xl">
              <CardContent className="p-0 relative">
                <div className="aspect-video bg-slate-900 relative overflow-hidden">
                  <img
                    src={tourSpots[activeSpot].image || "/placeholder.svg"}
                    alt={tourSpots[activeSpot].name}
                    className="w-full h-full object-cover"
                  />

                  {/* Tour Controls Overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="lg"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-[#002147]"
                    >
                      <Play className="mr-2 h-6 w-6" />
                      {isPlaying ? "Pause Tour" : "Start Tour"}
                    </Button>
                  </div>

                  {/* Tour Info */}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <h4 className="text-white font-semibold">{tourSpots[activeSpot].name}</h4>
                    <p className="text-white/80 text-sm">360° Interactive View</p>
                  </div>

                  {/* Tour Controls */}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm border-white/30">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm border-white/30">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm border-white/30">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Tour Description */}
                <div className="p-6 bg-gradient-to-r from-[#002147] to-[#003366]">
                  <h3 className="text-xl font-bold text-white mb-2">Discover {tourSpots[activeSpot].name}</h3>
                  <p className="text-slate-300">
                    Explore our state-of-the-art facilities and beautiful campus architecture. Use your mouse or touch
                    to look around in 360°.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
