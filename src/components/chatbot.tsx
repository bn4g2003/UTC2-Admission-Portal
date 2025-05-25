// components/chatbot.tsx
"use client"

import { useEffect } from "react"

export function ChatbotWidget() {
  useEffect(() => {
    // Tạo script để load chatbot
    const script = document.createElement('script')
    script.src = 'https://www.chatbase.co/embed.min.js'
    script.defer = true
    script.setAttribute('chatbotId', 'cK7OZb18IH5LmIDnqHCK_') 
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div id="chatbase-container" className="w-80 h-[4400px]"></div>
    </div>
  )
}