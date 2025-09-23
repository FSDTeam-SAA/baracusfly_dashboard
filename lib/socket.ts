import { io, type Socket } from "socket.io-client"

class SocketService {
  private socket: Socket | null = null
  private static instance: SocketService

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  connect(baseURL: string): Socket {
    if (!this.socket) {
      this.socket = io(baseURL, {
        transports: ["websocket"],
        autoConnect: true,
      })

      this.socket.on("connect", () => {
        console.log("[v0] Socket connected:", this.socket?.id)
      })

      this.socket.on("disconnect", () => {
        console.log("[v0] Socket disconnected")
      })

      this.socket.on("connect_error", (error) => {
        console.error("[v0] Socket connection error:", error)
      })
    }
    return this.socket
  }

  joinChatRoom(chatId: string) {
    if (this.socket) {
      this.socket.emit("joinChatRoom", chatId)
      console.log("[v0] Joined chat room:", chatId)
    }
  }

  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on("newMassage", callback)
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off("newMassage")
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export default SocketService
