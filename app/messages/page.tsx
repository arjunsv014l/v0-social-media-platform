"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeftIcon, PhoneIcon, SearchIcon, SendIcon, VideoIcon } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

const conversations = [
  {
    id: 1,
    name: "Emma Johnson",
    avatar: "/placeholder.svg?height=40&width=40&query=student profile 1",
    lastMessage: "Hey! Are you free to study together?",
    timestamp: "2m ago",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Study Group - CS101",
    avatar: "/placeholder.svg?height=40&width=40&query=group chat",
    lastMessage: "Alex: The assignment is due tomorrow!",
    timestamp: "15m ago",
    unread: 0,
    online: false,
    isGroup: true,
  },
  {
    id: 3,
    name: "Sarah Williams",
    avatar: "/placeholder.svg?height=40&width=40&query=student profile 3",
    lastMessage: "Thanks for the notes! 📚",
    timestamp: "1h ago",
    unread: 0,
    online: true,
  },
]

const messages = [
  {
    id: 1,
    sender: "Emma Johnson",
    content: "Hey! Are you free to study together for the midterm?",
    timestamp: "2:30 PM",
    isMe: false,
  },
  {
    id: 2,
    sender: "Me",
    content: "Yes! I was just thinking about that. When works for you?",
    timestamp: "2:32 PM",
    isMe: true,
  },
  {
    id: 3,
    sender: "Emma Johnson",
    content: "How about tomorrow at 3 PM in the library? We can go over the algorithms section together 📖",
    timestamp: "2:33 PM",
    isMe: false,
  },
  {
    id: 4,
    sender: "Me",
    content: "Perfect! See you there 🙌",
    timestamp: "2:35 PM",
    isMe: true,
  },
]

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [showMobile, setShowMobile] = useState(false)

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // In a real app, this would send the message
    alert(`Message sent: ${newMessage}`)
    setNewMessage("")
  }

  return (
    <SidebarInset>
      <div className="flex h-screen">
        {/* Conversations List */}
        <div className={`w-full md:w-80 border-r bg-background ${showMobile ? "hidden md:block" : "block"}`}>
          <div className="border-b p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Messages 💬
                </h1>
              </div>
            </div>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9" />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer hover:bg-accent ${
                    selectedChat.id === conversation.id ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    setSelectedChat(conversation)
                    setShowMobile(true)
                  }}
                >
                  <div className="relative">
                    <img
                      src={conversation.avatar || "/placeholder.svg"}
                      alt={conversation.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    {conversation.online && !conversation.isGroup && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{conversation.name}</h3>
                      <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread > 0 && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-background ${showMobile ? "block" : "hidden md:flex"}`}>
          {/* Chat Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobile(false)}>
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <img
                  src={selectedChat.avatar || "/placeholder.svg"}
                  alt={selectedChat.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold">{selectedChat.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.online ? "🟢 Online" : "Last seen 1h ago"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <PhoneIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <VideoIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isMe
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${message.isMe ? "text-blue-100" : "text-muted-foreground"}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                placeholder="Type a message... ✨"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" className="bg-gradient-to-r from-blue-500 to-purple-600">
                <SendIcon className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
