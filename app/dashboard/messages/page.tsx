"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { ChatSidebar } from "@/components/dashboard/chat-sidebar"
import { ChatWindow } from "@/components/dashboard/chat-window"
import { chatAPI } from "@/lib/api"
import SocketService from "@/lib/socket"
import { toast } from "sonner"

interface Message {
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
}

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
  messages: Message[]
  updatedAt: string
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [socketService] = useState(() => SocketService.getInstance())

  // Fetch user's chats
  const {
    data: chatsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["chats"],
    queryFn: () => chatAPI.getChatForUser(),
    enabled: !!session?.user,
  })

  const chats: Chat[] = chatsData?.data?.data || []

  // Initialize socket connection
  useEffect(() => {
    if (session?.user && process.env.NEXT_PUBLIC_BASE_URL) {
      const socket = socketService.connect(process.env.NEXT_PUBLIC_BASE_URL)

      // Listen for new messages
      socketService.onNewMessage((newMessage: Message) => {
        console.log("[v0] New message received:", newMessage)

        // Update the selected chat if it matches
        if (selectedChat && newMessage) {
          setSelectedChat((prev) => {
            if (prev && prev._id === selectedChat._id) {
              return {
                ...prev,
                messages: [...prev.messages, newMessage],
              }
            }
            return prev
          })
        }

        // Refetch chats to update sidebar
        refetch()

        // Show toast notification if message is not from current user
        if (newMessage.user._id !== session.user.id) {
          toast.info(`New message from ${newMessage.user.fullName}`)
        }
      })

      return () => {
        socketService.offNewMessage()
        socketService.disconnect()
      }
    }
  }, [session, selectedChat, refetch])

  // Join chat room when selecting a chat
  useEffect(() => {
    if (selectedChat) {
      socketService.joinChatRoom(selectedChat._id)
    }
  }, [selectedChat, socketService])

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
  }

  const handleNewMessage = (message: Message) => {
    // This will be called when a message is sent successfully
    if (selectedChat) {
      setSelectedChat((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, message],
            }
          : null,
      )
    }
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please log in to access messages</p>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50">
      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChat?._id}
        onChatSelect={handleChatSelect}
        currentUserRole={session.user.role || "admin"}
        isLoading={isLoading}
      />
      <ChatWindow
        chat={selectedChat}
        currentUserId={session.user.id || ""}
        currentUserRole={session.user.role || "admin"}
        onNewMessage={handleNewMessage}
      />
    </div>
  )
}
