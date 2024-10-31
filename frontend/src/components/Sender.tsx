// import { useEffect, useState } from "react"

// export const Sender = () => {
//     const [socket, setSocket] = useState<WebSocket | null>(null);
//     const [pc, setPC] = useState<RTCPeerConnection | null>(null);

//     useEffect(() => {
//         const socket = new WebSocket('ws://localhost:3000');
//         setSocket(socket);
//         socket.onopen = () => {
//             socket.send(JSON.stringify({
//                 type: 'sender'
//             }));
//         }
//     }, []);

//     const initiateConn = async () => {

//         if (!socket) {
//             alert("Socket not found");
//             return;
//         }

//         socket.onmessage = async (event) => {
//             const message = JSON.parse(event.data);
//             if (message.type === 'createAnswer') {
//                 await pc.setRemoteDescription(message.sdp);
//             } else if (message.type === 'iceCandidate') {
//                 pc.addIceCandidate(message.candidate);
//             }
//         }

//         const pc = new RTCPeerConnection();
//         setPC(pc);
//         pc.onicecandidate = (event) => {
//             if (event.candidate) {
//                 socket?.send(JSON.stringify({
//                     type: 'iceCandidate',
//                     candidate: event.candidate
//                 }));
//             }
//         }

//         pc.onnegotiationneeded = async () => {
//             const offer = await pc.createOffer();
//             await pc.setLocalDescription(offer);
//             socket?.send(JSON.stringify({
//                 type: 'createOffer',
//                 sdp: pc.localDescription
//             }));
//         }
            
//         getCameraStreamAndSend(pc);
//     }

//     const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
//         navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
//             const video = document.createElement('video');
//             video.srcObject = stream;
//             video.play();
//             // this is wrong, should propogate via a component
//             document.body.appendChild(video);
//             stream.getTracks().forEach((track) => {
//                 pc?.addTrack(track);
//             });
//         });
//     }

//     return <div>
//         Sender
//         <button onClick={initiateConn}> Send data </button>
//     </div>
// }

import { useEffect, useState } from "react"

export const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3000');
       
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'sender'
            }));
        }
        setSocket(socket);
    }, []);

    const startSendingVideo = async () => {
        if (!socket) { return; }
        //create an offer
        const pc = new RTCPeerConnection(); //starts a peer connection
        pc.onnegotiationneeded = async () => {  //when negotiation is needed then do this
            console.log('negotiation needed');
            const offer = await pc.createOffer();  //create an offer
            await pc.setLocalDescription(offer); //set the local description
            socket?.send(JSON.stringify({ type: 'createOffer', sdp: pc.localDescription }));   //send the offer to the other peer 
        }
       //video/audio
        pc.onicecandidate = (event) => {  //anytime an icecandidate is added 
            if (event.candidate) {
                socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate })); //let the other side know about the ice candidate and say set it in ur side 
            }
        }

        socket.onmessage = async (event) => {  //if the sender receives any answer from the receiver
            const data = JSON.parse(event.data);
            if (data.type === 'createAnswer') {
                pc.setRemoteDescription(data.sdp); //set the remote description of the answer
            } else if (data.type === 'iceCandidate') {
               // const pc = new RTCPeerConnection();
                pc.addIceCandidate(data.candidate); // add the ice candidate to the peer connection object
            }
        }
        //const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });         //can aslo look for screen sharing as well
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); //creates a stream of video and audio
        pc.addTrack(stream.getTracks()[0], stream); //adds the track to the peer connection object (to send the track we write this)

    }

    return <div>
        Sender
        <button onClick={startSendingVideo}> Send data </button>
    </div>
}