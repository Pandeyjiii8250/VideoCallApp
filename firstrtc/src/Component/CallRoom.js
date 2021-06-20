import React, {useEffect, useRef} from 'react'
import './CallRoom.css'

export default function CallRoom({socket}) {
    const myStream = useRef(null)
    const offerOptions = {
        offerToReceiveAudio: 0,
        offerToReceiveVideo: 1
    }
    let rtcPeerConnectionClient
    let rtcPeerConnectionUser

    // Contains the stun server URL we will be using.
    let iceServers = {
        iceServers: [
            // { urls: "stun:stun.services.mozilla.com" },
            // { urls: "stun:stun.l.google.com:19302" },
        ],
    };

    const getMyMedia = ()=>{
        window.navigator.getUserMedia({
            audio:false,
            video:true
        }, (stream)=>{
            const vdoMy = document.createElement('video')
            myStream.current = stream
            console.log(myStream)
            vdoMy.srcObject = stream
            vdoMy.onloadedmetadata = ()=>{
                vdoMy.play()
                vdoMy.muted = true
            }
            document.getElementById("my-cam").append(vdoMy)
            socket.emit('userReady', {"roomId":"2550"})
        },
        (e)=>{
            console.log(e)
        })
    }

    const OniceCandidateFunctionClient = (eve)=>{
        console.log("Client Candidate Sent")
        if(eve.candidate != null){
            socket.emit('sentClientIce', {'roomId':'2550', 'candidate':eve.candidate})
        }
    }

    const OniceCandidateFunctionUser = (eve)=>{
        console.log("User Candidate Sent")
        if(eve.candidate != null){
            socket.emit("sentUserIce", {'roomId':'2550','candidate':eve.candidate})
        }
    }

    const OntrackFunctionClient = (eve)=>{
        let userVdo = document.createElement('video')
        userVdo.srcObject = eve.streams[0]
        userVdo.addEventListener('loadedmetadata', ()=>{
            userVdo.muted = true
            userVdo.play()
        })
        document.getElementById('user-cam').append(userVdo)
    }


    const OntrackFunctionUser = (eve)=>{
        let userVdo = document.createElement('video')
        userVdo.srcObject = eve.streams[0]
        userVdo.addEventListener('loadedmetadata', ()=>{
            userVdo.muted = true
            userVdo.play()
        })
        document.getElementById('user-cam').append(userVdo)
    }

    useEffect(()=>{
        getMyMedia()
        socket.on('ready',(msg)=>{
            console.log("Creating offer")
            rtcPeerConnectionClient = new RTCPeerConnection(iceServers)
            rtcPeerConnectionClient.onicecandidate = OniceCandidateFunctionClient
            rtcPeerConnectionClient.ontrack = OntrackFunctionClient
            rtcPeerConnectionClient.addTrack(myStream.current.getTracks()[0], myStream.current) 
            rtcPeerConnectionClient.createOffer(offerOptions)
            .then((offer)=>{
                console.log("Offer Created")
                rtcPeerConnectionClient.setLocalDescription(offer,
                    ()=>{
                        console.log("It was successfull")
                    },
                    (eve)=>{
                        console.log(eve)
                    }
                )
                socket.emit('sendOffer', {"offer":offer, "roomId":msg.roomId})
            })
        })

        socket.on("setOffer", (data)=>{
            console.log("Setting Offer")
            rtcPeerConnectionUser = new RTCPeerConnection(iceServers)
            rtcPeerConnectionUser.ontrack = OntrackFunctionUser
            rtcPeerConnectionUser.onicecandidate = OniceCandidateFunctionUser
            rtcPeerConnectionUser.addTrack(myStream.current.getTracks()[0], myStream.current)
            rtcPeerConnectionUser.setRemoteDescription(data.offer)
            rtcPeerConnectionUser.createAnswer().then((answer)=>{
                console.log(answer)
                rtcPeerConnectionUser.setLocalDescription(answer, 
                    ()=>{
                        console.log('Answer set as local successfull')
                    },
                    (eve)=>{
                        console.log(eve)
                    }
                )
                socket.emit("sendAns", {"roomId":data.roomId, "ans":answer})
            })
        })

        socket.on('setAns', (data)=>{
            console.log("Setting Answer")
            rtcPeerConnectionClient.setRemoteDescription(data.ans)
        })

        socket.on("setClientIce", (data)=>{
            console.log("Setting Client Ice")
            let iceCandidate = new RTCIceCandidate(data.candidate)
            rtcPeerConnectionUser.addIceCandidate(iceCandidate)
        })

        socket.on("setUserIce", (data)=>{
            console.log("Setting User Ice")
            let iceCandidate = new RTCIceCandidate(data.candidate)
            rtcPeerConnectionClient.addIceCandidate(iceCandidate)

        })
        
    },[])



    return (
        <div>
            <div className="incoming-call" id="user-cam">

            </div>
            <div className="my-camera" id="my-cam">

            </div>
        </div>
    )
}
