"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeftIcon, PhoneIcon, SearchIcon, SendIcon, VideoIcon, Loader2 } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface Conversation {
  id: string
  profile: any
  lastMessage?: any
  unreadCount?: number
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  isMe?: boolean
}

export default function MessagesPage() {
  const { user, profile: currentUserProfile } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  // Refs to prevent infinite operations
  const mountedRef = useRef(true)
  const conversationsSubscriptionRef = useRef<any>(null)
  const chatSubscriptionRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch conversations
  useEffect(() => {
    if (!user?.id) return

    mountedRef.current = true

    const fetchConversations = async () => {
      if (!mountedRef.current) return

      setLoadingConversations(true)
      try {
        // Get distinct user IDs the current user has messaged or received messages from
        const { data: messagePeers, error: peersError } = await supabase.rpc("get_message_peers", {
          p_user_id: user.id,
        })

        if (peersError) {
          console.error("Error fetching message peers:", peersError)
          toast({ title: "Error", description: "Could not load conversations.", variant: "destructive" })
          return
        }

        if (!messagePeers || messagePeers.length === 0) {
          if (mountedRef.current) {
            setConversations([])
          }
          return
        }

        const peerIds = messagePeers.map((p: any) => p.peer_id)

        // Fetch profiles for these peers
        const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", peerIds)

        if (profilesError) {
          console.error("Error fetching peer profiles:", profilesError)
          return
        }

        // For each peer, get the last message and unread count
        const convPromises = profiles.map(async (peerProfile) => {
          const { data: lastMsgData, error: lastMsgError } = await supabase
            .from("messages")
            .select("*")
            .or(
              `(sender_id.eq.${user.id},receiver_id.eq.${peerProfile.id}),(sender_id.eq.${peerProfile.id},receiver_id.eq.${user.id})`,
            )
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          const { count: unreadCount, error: unreadError } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("sender_id", peerProfile.id)
            .eq("receiver_id", user.id)
            .eq("read", false)

          return {
            id: peerProfile.id,
            profile: peerProfile,
            lastMessage: lastMsgError ? null : lastMsgData,
            unreadCount: unreadError ? 0 : unreadCount || 0,
          }
        })

        const fetchedConversations = await Promise.all(convPromises)
        // Sort conversations by last message timestamp
        fetchedConversations.sort((a, b) => {
          if (!a.lastMessage) return 1
          if (!b.lastMessage) return -1
          return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
        })

        if (mountedRef.current) {
          setConversations(fetchedConversations)
        }
      } catch (error) {
        console.error("Error in fetchConversations:", error)
      } finally {
        if (mountedRef.current) {
          setLoadingConversations(false)
        }
      }
    }

    fetchConversations()

    // Real-time subscription for new messages affecting conversation list
    conversationsSubscriptionRef.current = supabase
      .channel("public:messages:conversations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMessage = payload.new as Message
        if (newMessage.sender_id === user.id || newMessage.receiver_id === user.id) {
          fetchConversations()
        }
      })
      .subscribe()

    return () => {
      mountedRef.current = false
      if (conversationsSubscriptionRef.current) {
        supabase.removeChannel(conversationsSubscriptionRef.current)
        conversationsSubscriptionRef.current = null
      }
    }
  }, [user?.id, toast])

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat || !user?.id) {
      setMessages([])
      return
    }

    const fetchMessages = async () => {
      if (!mountedRef.current) return

      setLoadingMessages(true)
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(
            `(sender_id.eq.${user.id},receiver_id.eq.${selectedChat.id}),(sender_id.eq.${selectedChat.id},receiver_id.eq.${user.id})`,
          )
          .order("created_at", { ascending: true })

        if (error) {
          console.error("Error fetching messages:", error)
          toast({ title: "Error", description: "Could not load messages.", variant: "destructive" })
        } else if (mountedRef.current) {
          setMessages(data.map((m) => ({ ...m, isMe: m.sender_id === user.id })))
          // Mark messages as read
          await supabase
            .from("messages")
            .update({ read: true })
            .eq("sender_id", selectedChat.id)
            .eq("receiver_id", user.id)
            .eq("read", false)
          // Update unread count in conversation list
          setConversations((prev) =>
            prev.map((conv) => (conv.id === selectedChat.id ? { ...conv, unreadCount: 0 } : conv)),
          )
        }
      } catch (error) {
        console.error("Error in fetchMessages:", error)
      } finally {
        if (mountedRef.current) {
          setLoadingMessages(false)
        }
      }
    }

    fetchMessages()

    // Clean up previous chat subscription
    if (chatSubscriptionRef.current) {
      supabase.removeChannel(chatSubscriptionRef.current)
    }

    // Real-time subscription for messages in the current chat
    chatSubscriptionRef.current = supabase
      .channel(`public:messages:chat:${selectedChat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id},sender_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          const newMessagePayload = payload.new as Message
          if (mountedRef.current) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { ...newMessagePayload, isMe: newMessagePayload.sender_id === user.id },
            ])
            // Mark as read if this user is the receiver
            if (newMessagePayload.receiver_id === user.id) {
              supabase.from("messages").update({ read: true }).eq("id", newMessagePayload.id).then()
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${user.id},receiver_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          const newMessagePayload = payload.new as Message
          if (mountedRef.current) {
            setMessages((prevMessages) => [...prevMessages, { ...newMessagePayload, isMe: true }])
          }
        },
      )
      .subscribe()

    return () => {
      if (chatSubscriptionRef.current) {
        supabase.removeChannel(chatSubscriptionRef.current)
        chatSubscriptionRef.current = null
      }
    }
  }, [selectedChat, user?.id, toast])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (conversationsSubscriptionRef.current) {
        supabase.removeChannel(conversationsSubscriptionRef.current)
      }
      if (chatSubscriptionRef.current) {
        supabase.removeChannel(chatSubscriptionRef.current)
      }
    }
  }, [])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user?.id || !selectedChat) return

    setSendingMessage(true)
    const messageToSend = {
      sender_id: user.id,
      receiver_id: selectedChat.id,
      content: newMessage.trim(),
    }

    try {
      const { error } = await supabase.from("messages").insert(messageToSend)

      if (error) {
        console.error("Error sending message:", error)
        toast({ title: "Error", description: "Could not send message.", variant: "destructive" })
      } else {
        setNewMessage("")
        // Update conversation list optimistically
        setConversations((prevConvs) =>
          prevConvs
            .map((c) =>
              c.id === selectedChat.id
                ? { ...c, lastMessage: { content: messageToSend.content, created_at: new Date().toISOString() } }
                : c,
            )
            .sort((a, b) => {
              if (!a.lastMessage) return 1
              if (!b.lastMessage) return -1
              return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
            }),
        )
      }
    } catch (error) {
      console.error("Error in sendMessage:", error)
      toast({ title: "Error", description: "Could not send message.", variant: "destructive" })
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <SidebarInset>
      <div className="flex h-screen">
        {/* Conversations List */}
        <div
          className={`w-full md:w-80 border-r bg-background ${
            showMobileChat && selectedChat ? "hidden md:flex md:flex-col" : "flex flex-col"
          }`}
        >
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
          <ScrollArea className="flex-1">
            {loadingConversations ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading conversations...</p>
                </div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No conversations yet.</div>
            ) : (
              <div className="p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer hover:bg-accent ${
                      selectedChat?.id === conversation.id ? "bg-accent" : ""
                    }`}
                    onClick={() => {
                      setSelectedChat(conversation)
                      setShowMobileChat(true)
                    }}
                  >
                    <div className="relative">
                      <img
                        src={
                          conversation.profile.avatar_url || "/placeholder.svg?height=40&width=40&query=student profile"
                        }
                        alt={conversation.profile.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{conversation.profile.full_name}</h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-background ${showMobileChat && selectedChat ? "flex" : "hidden md:flex"}`}
        >
          {selectedChat ? (
            <>
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileChat(false)}>
                      <ArrowLeftIcon className="h-5 w-5" />
                    </Button>
                    <img
                      src={
                        selectedChat.profile.avatar_url || "/placeholder.svg?height=40&width=40&query=student profile"
                      }
                      alt={selectedChat.profile.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="font-semibold">{selectedChat.profile.full_name}</h2>
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

              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading messages...</p>
                    </div>
                  </div>
                ) : (
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
                          <p
                            className={`text-xs mt-1 ${message.isMe ? "text-blue-100/80" : "text-muted-foreground/80"}`}
                          >
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="border-t p-4">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type a message... ✨"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    disabled={sendingMessage}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                    disabled={sendingMessage || !newMessage.trim()}
                  >
                    {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </SidebarInset>
  )
}
