import { io } from "socket.io-client";
import { useRef, useEffect, useState } from "react";
import { FiVideo, FiVideoOff, FiMic, FiMicOff } from "react-icons/fi";
import { ImPhoneHangUp } from "react-icons/im";

const configuration = {
    iceServers: [
        {
            urls: [ "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302" ],
        },
    ],
    iceCandidatePoolSize: 10,
};
const socket = io( "http://10.20.203.240:3000", { transports: [ "websocket" ] } );

let pc;
let localStream;
let startButton;
let muteAudButton;
let remoteVideo;
let localVideo;
socket.on( "message", ( e ) =>
{
    if ( !localStream )
    {
        console.log( "not ready yet" );
        return;
    }
    switch ( e.type )
    {
        case "offer":
            handleOffer( e );
            break;
        case "answer":
            handleAnswer( e );
            break;
        case "candidate":
            handleCandidate( e );
            break;
        case "ready":
            // A second tab joined. This tab will initiate a call unless in a call already.
            if ( pc )
            {
                console.log( "already in call, ignoring" );
                return;
            }
            makeCall();
            break;
        case "bye":
            if ( pc )
            {
                hangup();
            }
            break;
        default:
            console.log( "unhandled", e );
            break;
    }
} );

async function makeCall ()
{
    try
    {
        pc = new RTCPeerConnection( configuration );
        pc.onicecandidate = ( e ) =>
        {
            const message = {
                type: "candidate",
                candidate: null,
            };
            if ( e.candidate )
            {
                message.candidate = e.candidate.candidate;
                message.sdpMid = e.candidate.sdpMid;
                message.sdpMLineIndex = e.candidate.sdpMLineIndex;
            }
            socket.emit( "message", message );
        };
        pc.ontrack = ( e ) => ( remoteVideo.current.srcObject = e.streams[ 0 ] );
        localStream.getTracks().forEach( ( track ) => pc.addTrack( track, localStream ) );
        const offer = await pc.createOffer();
        socket.emit( "message", { type: "offer", sdp: offer.sdp } );
        await pc.setLocalDescription( offer );
    } catch ( e )
    {
        console.log( e );
    }
}

async function handleOffer ( offer )
{
    if ( pc )
    {
        console.error( "existing peerconnection" );
        return;
    }
    try
    {
        pc = new RTCPeerConnection( configuration );
        pc.onicecandidate = ( e ) =>
        {
            const message = {
                type: "candidate",
                candidate: null,
            };
            if ( e.candidate )
            {
                message.candidate = e.candidate.candidate;
                message.sdpMid = e.candidate.sdpMid;
                message.sdpMLineIndex = e.candidate.sdpMLineIndex;
            }
            socket.emit( "message", message );
        };
        pc.ontrack = ( e ) => ( remoteVideo.current.srcObject = e.streams[ 0 ] );
        localStream.getTracks().forEach( ( track ) => pc.addTrack( track, localStream ) );
        await pc.setRemoteDescription( offer );

        const answer = await pc.createAnswer();
        socket.emit( "message", { type: "answer", sdp: answer.sdp } );
        await pc.setLocalDescription( answer );
    } catch ( e )
    {
        console.log( e );
    }
}

async function handleAnswer ( answer )
{
    if ( !pc )
    {
        console.error( "no peerconnection" );
        return;
    }
    try
    {
        await pc.setRemoteDescription( answer );
    } catch ( e )
    {
        console.log( e );
    }
}

async function handleCandidate ( candidate )
{
    try
    {
        if ( !pc )
        {
            console.error( "no peerconnection" );
            return;
        }
        if ( !candidate )
        {
            await pc.addIceCandidate( null );
        } else
        {
            await pc.addIceCandidate( candidate );
        }
    } catch ( e )
    {
        console.log( e );
    }
}
async function hangup ()
{
    if ( pc )
    {
        pc.close();
        pc = null;
    }
    localStream.getTracks().forEach( ( track ) => track.stop() );
    localStream = null;
}

function App ()
{
    startButton = useRef( null );
    muteAudButton = useRef( null );
    localVideo = useRef( null );
    remoteVideo = useRef( null );

    const [ audiostate, setAudio ] = useState( false );
    const [ videoState, setVideo ] = useState( false );

    const startB = async () =>
    {
        try
        {
            localStream = await navigator.mediaDevices.getUserMedia( {
                video: true,
                audio: { echoCancellation: true },
            } );
            localVideo.current.srcObject = localStream;
        } catch ( err )
        {
            console.log( err );
        }
        socket.emit( "message", { type: "ready" } );
    };

    const hangB = async () =>
    {
        hangup();
        socket.emit( "message", { type: "bye" } );
    };

    function muteAudio ()
    {
        if ( localStream )
        {
            const audioTracks = localStream.getAudioTracks();
            if ( audioTracks.length > 0 )
            {
                const audioTrack = audioTracks[ 0 ];
                audioTrack.enabled = !audioTrack.enabled;

                setAudio( audioTrack.enabled );

                console.log( audioTrack.enabled ? "Audio unmuted" : "Audio muted" );
            }
        }
    }


    async function toggleVideo ()
    {
        if ( videoState )
        {
            await setVideo( false );
            await hangB();
            console.log( 'Video turned off' );
        } else
        {
            await setVideo( true );
            await startB();
            console.log( 'Video turned on' );
        }
    }

    return (
        <>
            <main className="flex flex-col w-screen h-screen items-center justify-center bg-gray-950 gap-y-5">
                <div className="w-full md:w-3/4 p-3 md:p-0 flex flex-col md:flex-row items-center justify-between gap-y-4">
                    <video ref={localVideo} className="video" autoPlay playsInline src=" "></video>
                    <video ref={remoteVideo} className="video" autoPlay playsInline src=" "></video>
                </div>

                <div className="flex flex-row items-center justify-center gap-x-4">
                    <button className="button" ref={startButton} onClick={toggleVideo} style={{ backgroundColor: videoState ? 'rgb(3 7 18)' : 'red', color: videoState ? 'rgb(156 163 175)' : 'rgb(3 7 18)' }}>
                        {videoState ? <FiVideo /> : <FiVideoOff />}
                    </button>
                    <button className="button" ref={muteAudButton} onClick={muteAudio} style={{ backgroundColor: audiostate ? 'rgb(3 7 18)' : 'red', color: audiostate ? 'rgb(156 163 175)' : 'rgb(3 7 18)' }}>
                        {audiostate ? <FiMic /> : <FiMicOff />}
                    </button>
                </div>
            </main>
        </>
    );
}

export default App
