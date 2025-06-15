"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button2"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "../../hooks/use-auth"
import { 
  MessageCircle, 
  Send, 
  Users, 
  Plus, 
  User,
  Clock,
  CheckCircle2
} from "lucide-react"

interface Message {
  id: string
  message_content: string
  sent_at: string
  sender_name: string
  sender_id: string
  receiver_id?: string
  chat_room_id?: string
}

interface Conversation {
  other_user_id: string
  other_user_name: string
  other_user_role: string
  last_message: string
  last_message_time: string
}

interface ChatRoom {
  id: string
  room_name: string
  created_at: string
  member_count: number
  last_message: string
  last_message_time: string
}

interface UserOption {
  id: string
  full_name: string
  email: string
  role: string
}

export default function ChatComponent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"conversations" | "rooms">("conversations")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChat, setSelectedChat] = useState<{type: "user" | "room", id: string, name: string} | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<UserOption[]>([])
  const [showNewRoomDialog, setShowNewRoomDialog] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (user) {
      fetchConversations()
      fetchChatRooms()
      fetchUsers()
    }
  }, [user])

  // Separate useEffect for SSE connection
  useEffect(() => {
    if (user) {
      initSSEConnection()
    }
    
    // Cleanup SSE connection on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [user])
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Khởi tạo SSE connection
  const initSSEConnection = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource('/api/chat/events')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      console.log('SSE connection opened')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'connected':
            console.log('SSE connected for user:', data.userId)
            break
            
          case 'new_message':
            const newMessage = data.data
            
            // Chỉ cập nhật messages nếu tin nhắn thuộc về cuộc trò chuyện hiện tại
            if (selectedChat) {
              const isRelevantMessage = 
                (selectedChat.type === "user" && 
                 (newMessage.sender_id === selectedChat.id || newMessage.receiver_id === selectedChat.id)) ||
                (selectedChat.type === "room" && newMessage.chat_room_id === selectedChat.id)
              
              if (isRelevantMessage) {
                setMessages(prev => {
                  // Tránh duplicate messages
                  const exists = prev.some(msg => msg.id === newMessage.id)
                  if (exists) return prev
                  return [...prev, newMessage]
                })
              }
            }
            
            // Cập nhật danh sách conversations/rooms
            if (newMessage.receiver_id) {
              fetchConversations()
            } else if (newMessage.chat_room_id) {
              fetchChatRooms()
            }
            break
            
          case 'ping':
            // Keep connection alive
            break
            
          default:
            console.log('Unknown SSE message type:', data.type)
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      setIsConnected(false)
      
      // Retry connection after 5 seconds
      setTimeout(() => {
        if (user) {
          initSSEConnection()        }
      }, 5000)
    }

    eventSource.addEventListener('close', () => {
      setIsConnected(false)
      console.log('SSE connection closed')
    })
  }
  // Remove old polling logic since we're using SSE now
  // useEffect(() => {
  //   let interval: NodeJS.Timeout
  //   if (selectedChat) {
  //     interval = setInterval(() => {
  //       fetchMessages()
  //     }, 3000)
  //   }
  //   return () => {
  //     if (interval) clearInterval(interval)
  //   }
  // }, [selectedChat])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat/conversations", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const fetchChatRooms = async () => {
    try {
      const response = await fetch("/api/chat/rooms", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setChatRooms(data)
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/chat", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchMessages = async () => {
    if (!selectedChat) return
    
    try {
      const url = selectedChat.type === "user" 
        ? `/api/chat/messages?receiverId=${selectedChat.id}`
        : `/api/chat/messages?roomId=${selectedChat.id}`
      
      const response = await fetch(url, {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return
    
    setIsLoading(true)
    try {
      const body = selectedChat.type === "user" 
        ? { message: newMessage, receiverId: selectedChat.id }
        : { message: newMessage, roomId: selectedChat.id }

      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const responseData = await response.json()
        setNewMessage("")
        
        // Thêm tin nhắn của chính mình vào messages ngay lập tức
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === responseData.id)
          if (exists) return prev
          return [...prev, responseData]
        })
        
        // Cập nhật danh sách conversations/rooms (không cần fetch messages vì SSE sẽ handle)
        if (selectedChat.type === "user") {
          await fetchConversations()
        } else {
          await fetchChatRooms()
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createChatRoom = async () => {
    if (!newRoomName.trim() || selectedMembers.length === 0) return

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          roomName: newRoomName,
          memberIds: selectedMembers
        })
      })

      if (response.ok) {
        setShowNewRoomDialog(false)
        setNewRoomName("")
        setSelectedMembers([])
        await fetchChatRooms()
      }
    } catch (error) {
      console.error("Error creating chat room:", error)
    }
  }

  const selectChat = (type: "user" | "room", id: string, name: string) => {
    setSelectedChat({ type, id, name })
    setMessages([])
    // Fetch messages for the selected chat
    setTimeout(() => {
      if (type === "user") {
        fetch(`/api/chat/messages?receiverId=${id}`, { credentials: "include" })
          .then(res => res.json())
          .then(data => setMessages(data))
      } else {
        fetch(`/api/chat/messages?roomId=${id}`, { credentials: "include" })
          .then(res => res.json())
          .then(data => setMessages(data))
      }
    }, 100)
  }

  const startNewConversation = (userId: string, userName: string) => {
    selectChat("user", userId, userName)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return formatTime(dateString)
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua"
    } else {
      return date.toLocaleDateString("vi-VN")
    }
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-amber-50 to-amber-100/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Tin nhắn</h3>
            <Dialog open={showNewRoomDialog} onOpenChange={setShowNewRoomDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Tạo nhóm
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo phòng chat mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roomName">Tên phòng chat</Label>
                    <Input
                      id="roomName"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Nhập tên phòng chat..."
                    />
                  </div>
                  <div>
                    <Label>Thêm thành viên</Label>
                    <Select onValueChange={(value) => {
                      if (!selectedMembers.includes(value)) {
                        setSelectedMembers([...selectedMembers, value])
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thành viên..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedMembers.map((memberId) => {
                        const member = users.find(u => u.id === memberId)
                        return (
                          <Badge key={memberId} variant="secondary" className="flex items-center gap-1">
                            {member?.full_name}
                            <button
                              onClick={() => setSelectedMembers(selectedMembers.filter(id => id !== memberId))}
                              className="ml-1 text-xs"
                            >
                              ×
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                  <Button onClick={createChatRoom} className="w-full">
                    Tạo phòng chat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("conversations")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "conversations"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <User className="h-4 w-4 inline mr-1" />
              Cá nhân
            </button>
            <button
              onClick={() => setActiveTab("rooms")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "rooms"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="h-4 w-4 inline mr-1" />
              Nhóm
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "conversations" && (
            <div className="space-y-1 p-2">
              {/* New conversation section */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2 px-2">Bắt đầu cuộc trò chuyện mới:</p>
                {users.slice(0, 5).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startNewConversation(user.id, user.full_name)}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 flex-1 text-left">
                      <p className="font-medium text-sm">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              {conversations.length > 0 && (
                <>
                  <p className="text-sm text-gray-500 mb-2 px-2">Cuộc trò chuyện gần đây:</p>
                  {conversations.map((conv) => (
                    <button
                      key={conv.other_user_id}
                      onClick={() => selectChat("user", conv.other_user_id, conv.other_user_name)}
                      className={`w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedChat?.type === "user" && selectedChat?.id === conv.other_user_id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {conv.other_user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3 flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{conv.other_user_name}</p>
                          {conv.last_message_time && (
                            <span className="text-xs text-gray-500">
                              {formatDate(conv.last_message_time)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {conv.last_message || "Chưa có tin nhắn"}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === "rooms" && (
            <div className="space-y-1 p-2">
              {chatRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => selectChat("room", room.id, room.room_name)}
                  className={`w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedChat?.type === "room" && selectedChat?.id === room.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="ml-3 flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{room.room_name}</p>
                      {room.last_message_time && (
                        <span className="text-xs text-gray-500">
                          {formatDate(room.last_message_time)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate">
                        {room.last_message || "Chưa có tin nhắn"}
                      </p>
                      <span className="text-xs text-gray-400 ml-2">
                        {room.member_count} thành viên
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>            {/* Chat Header */}
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                  selectedChat.type === "room" ? "bg-green-500" : "bg-blue-500"
                }`}>
                  {selectedChat.type === "room" ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    selectedChat.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">{selectedChat.name}</h4>
                  <p className="text-sm text-gray-500">
                    {selectedChat.type === "room" ? "Phòng chat nhóm" : "Trò chuyện cá nhân"}
                  </p>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {message.sender_id !== user?.id && selectedChat.type === "room" && (
                      <p className="text-xs font-medium mb-1">{message.sender_name}</p>
                    )}
                    <p className="text-sm">{message.message_content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {formatTime(message.sent_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn một cuộc trò chuyện</h3>
              <p className="text-gray-500">Chọn một người dùng hoặc phòng chat để bắt đầu nhắn tin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
