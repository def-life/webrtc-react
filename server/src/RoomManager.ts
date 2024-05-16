import { WebSocket } from "ws"

export class RoomManager {
    roomMapping: Map<string, WebSocket[]>

    constructor() {
        this.roomMapping = new Map()
    }

    addSocket(ws: WebSocket, roomId: string) {
        this.roomMapping.set(roomId, [...(this.roomMapping.get(roomId) ?? []), ws])
    }

    broadCastToOthers(currentWs: WebSocket, roomId: string, message: string) {
        const sockets = this.roomMapping.get(roomId)
        if (!sockets) return
        sockets.forEach((socket) => {
            if (currentWs == socket) return
            socket.send(message)
        })
    }

    broadCast(roomId: string, message: string) {
        const sockets = this.roomMapping.get(roomId)
        if (!sockets) return
        sockets.forEach((socket) => {
            socket.send(message)
        })
    }


}