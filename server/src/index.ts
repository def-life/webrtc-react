import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './RoomManager';

const wss = new WebSocketServer({ port: 8080 });
const roomManager = new RoomManager()

// for simplicity, implementation expects only 2 sockets.


wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    const roomId = "group-call"

    roomManager.addSocket(ws, roomId)
    console.log("connected a socket", roomManager.roomMapping.get(roomId)?.length)

    ws.on('message', function message(data: any) {
        const message = JSON.parse(data);
        const payload = message.payload


        switch (message.type) {
            case "offer":
                roomManager.broadCastToOthers(ws, roomId, JSON.stringify({ type: "offer", payload: { sdp: payload.sdp } }))
                break;
            case 'answer':
                roomManager.broadCastToOthers(ws, roomId, JSON.stringify({ type: "answer", payload: { sdp: payload.sdp } }))
                break;
            case "add-ice-candidate":
                roomManager.broadCastToOthers(ws, roomId, JSON.stringify({ type: "add-ice-candidate", payload: { candidate: payload.candidate, sender: payload.sender } }))
                break;
        }

    });

    if (roomManager.roomMapping.get(roomId)?.length === 2) {
        roomManager.broadCast(roomId, JSON.stringify({ type: "send_offer" }))
    }

});