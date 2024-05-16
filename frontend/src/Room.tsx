import { useEffect, useRef, useState } from "react";

type RoomProps = {
    localAudioTrack: MediaStreamTrack | null
    localVideoTrack: MediaStreamTrack | null
    localStream: MediaStream | null
}

function Room(props: RoomProps) {
    const { localVideoTrack, localAudioTrack, localStream } = props
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [senderPC, setSenderPC] = useState<RTCPeerConnection | null>(null)
    const [receiverPC, setReceiverPC] = useState<RTCPeerConnection | null>(null)
    const localVideoRef = useRef<HTMLVideoElement | null>(null)
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            setSocket(socket);
        }
    }, []);

    useEffect(() => {
        if (socket) {
            console.log('create a pc connection',)
            const pc = new RTCPeerConnection() // sender
            const pc2 = new RTCPeerConnection() // receiver
            setSenderPC(pc)
            setReceiverPC(pc2)

            socket.onmessage = async (event) => {
                const message = JSON.parse(event.data);
                const payload = message.payload

                pc2.ontrack = (e) => {
                    console.log('track', e.track)

                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = new MediaStream([e.track])

                    }

                }

                pc2.onicecandidate = (e) => {
                    if (e.candidate) {
                        socket.send(JSON.stringify({
                            type: 'add-ice-candidate', payload: {
                                sender: false, candidate: e.candidate
                            }
                        }))
                    }
                }

                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        socket.send(JSON.stringify({
                            type: 'add-ice-candidate', payload: {
                                sender: true, candidate: e.candidate
                            }
                        }))
                    }
                }


                pc.onnegotiationneeded = async () => {
                    const offer = await pc.createOffer()
                    await pc.setLocalDescription(offer)
                    socket.send(JSON.stringify({ type: "offer", payload: { sdp: offer } }))

                }

                switch (message.type) {
                    case "send_offer": {
                        console.log('send_offer')

                        if (localAudioTrack && localStream) {
                            pc.addTrack(localAudioTrack, localStream)
                        }
                        if (localVideoTrack && localStream) {
                            pc.addTrack(localVideoTrack, localStream)
                        }


                        break
                    }

                    case "offer": {
                        console.log("received offer", "sdp is", payload.sdp)
                        await pc2.setRemoteDescription(payload.sdp)
                        const answer = await pc2.createAnswer()
                        await pc2.setLocalDescription(answer)

                        socket.send(JSON.stringify({ type: "answer", payload: { sdp: answer } }))

                        break;
                    }

                    case "answer": {
                        await pc.setRemoteDescription(payload.sdp)

                        break;
                    }
                    case "add-ice-candidate": {
                        console.log('received ice candidate',)
                        if (payload.sender) {
                            pc2.addIceCandidate(payload.candidate)

                        } else {
                            pc.addIceCandidate(payload.candidate)
                        }
                    }




                }

            }
            return () => {
                pc && pc.close()
                pc2 && pc2.close()
            }
        }
    }, [socket])

    useEffect(() => {
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream])




    return (
        <div>
            <video style={{ width: "300px" }} autoPlay ref={localVideoRef} />
            <video style={{ width: "300px" }} autoPlay ref={remoteVideoRef} />
        </div>
    )
}

export default Room