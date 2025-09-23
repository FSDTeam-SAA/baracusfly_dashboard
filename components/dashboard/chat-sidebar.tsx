"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface Chat {
  _id: string
  user?: {
    _id: string
    fullName: string
    avatar?: string
  }
  seller?: {
    _id: string
    fullName: string
    avatar?: string
  }
  messages: Array<{
    _id: string
    text: string
    user: {
      _id: string
      fullName: string
      role: string
      avatar?: string
    }
    date: string
    read: boolean
  }>
  updatedAt: string
}

interface ChatSidebarProps {
  chats: Chat[]
  selectedChatId?: string
  onChatSelect: (chat: Chat) => void
  currentUserRole: string
  isLoading?: boolean
}

export function ChatSidebar({ chats, selectedChatId, onChatSelect, currentUserRole, isLoading }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = chats.filter((chat) => {
    const otherUser = currentUserRole === "seller" ? chat.user : chat.seller
    return otherUser?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (isLoading) {
    return (
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search Message" className="pl-10" disabled />
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 border-r bg-white">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search Message"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-y-auto h-full">
        {filteredChats.map((chat) => {
          const otherUser = currentUserRole === "seller" ? chat.user : chat.seller
          const lastMessage = chat.messages[chat.messages.length - 1]
          const isSelected = selectedChatId === chat._id

          return (
            <div
              key={chat._id}
              onClick={() => onChatSelect(chat)}
              className={cn(
                "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                isSelected && "bg-green-50 border-r-2 border-r-green-600",
              )}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={otherUser?.avatar || "/placeholder.svg?height=48&width=48"} />
                  <AvatarFallback>
                    {otherUser?.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {otherUser?.fullName || "Unknown User"}
                    </p>
                    {lastMessage && <span className="text-xs text-gray-500">{formatTime(lastMessage.date)}</span>}
                  </div>
                  {lastMessage && <p className="text-sm text-gray-500 truncate mt-1">{lastMessage.text}</p>}
                </div>
              </div>
            </div>
          )
        })}

        {filteredChats.length === 0 && !isLoading && (
          <div className="p-8 text-center text-gray-500">
            <p>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  )
}
