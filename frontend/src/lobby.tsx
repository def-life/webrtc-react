import { useEffect, useRef, useState } from "react"
import Room from "./Room"

function Lobby() {
    const [joined, setJoined] = useState(false)
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null)
    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null)
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)


    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    setLocalStream(stream)
                    setLocalAudioTrack(stream.getAudioTracks()[0])
                    setLocalVideoTrack(stream.getVideoTracks()[0])
                }

            })

    }, [videoRef])

    if (!joined) {
        return <div>
            <video style={{ width: "300px" }} autoPlay ref={videoRef} />
            <button onClick={() => {
                setJoined(true)
            }}>Join</button>
        </div>
    }




    return (
        <>
            <Room localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} localStream={localStream} />
        </>
    )
}

export default Lobby