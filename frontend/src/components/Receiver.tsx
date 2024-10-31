// import { useEffect } from "react"


// export const Receiver = () => {
    
//     useEffect(() => {
//         const socket = new WebSocket('ws://localhost:3000');
//         socket.onopen = () => {
//             socket.send(JSON.stringify({
//                 type: 'receiver'
//             }));
//         }
//         startReceiving(socket);
//     }, []);

//     function startReceiving(socket: WebSocket) {
//         const video = document.createElement('video');
//         document.body.appendChild(video);

//         const pc = new RTCPeerConnection();
//         pc.ontrack = (event) => {
//             video.srcObject = new MediaStream([event.track]);
//             video.play();
//         }

//         socket.onmessage = (event) => {
//             const message = JSON.parse(event.data);
//             if (message.type === 'createOffer') {
//                 pc.setRemoteDescription(message.sdp).then(() => {
//                     pc.createAnswer().then((answer) => {
//                         pc.setLocalDescription(answer);
//                         socket.send(JSON.stringify({
//                             type: 'createAnswer',
//                             sdp: answer
//                         }));
//                     });
//                 });
//             } else if (message.type === 'iceCandidate') {
//                 pc.addIceCandidate(message.candidate);
//             }
//         }
//     }

//     return <div>
        
//     </div>
// }

import { useEffect, useRef } from "react"


export const Receiver = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3000');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
       socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        let pc: RTCPeerConnection = new RTCPeerConnection();
        if (message.type === 'createOffer') {  //when receiver will receive createoffer mnessage 
            pc = new RTCPeerConnection(); //create a new peer connection
            pc.setRemoteDescription(message.sdp); //sets it's own remote description of the offer sent by another browser
            pc.onicecandidate = (event) => {  // anytime receive ice candidate i need to send it to the sender
                if (event.candidate) {
                    socket?.send(JSON.stringify({
                        type: 'iceCandidate',
                        candidate: event.candidate
                    }));
                }
            }

            pc.ontrack = (event) => {  // anytime a receive a track i need to play it in the video element (to get the track we write ontrack event)
                //without useRef hook
                    const video = document.createElement('video');
                    document.body.appendChild(video);
                    //video.controls = true; //add a platy button to show up the video
                    video.srcObject = new MediaStream([event.track]);
                    video.play();


                //If we use UseRef hook to get the video element, we can use the videoRef.current to access the video element.
                    // if (videoRef.current) {
                    //     videoRef.current.srcObject = new MediaStream([event.track]);
                    //     videoRef.current.play();
                    // }
            }
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer); //creates it's own local description of the answer and sends to the another browser 
            socket.send(JSON.stringify({
                type: 'createAnswer',
                sdp: pc.localDescription
            }));
        }
    
        else if (message.type === 'iceCandidate') {
            pc?.addIceCandidate(message.candidate);
      }
    };
    }, []);

      

    return <div>
        Receiver 
        {/* <video ref={videoRef}></video> used useRef hook to get the video element */}
    </div>
}