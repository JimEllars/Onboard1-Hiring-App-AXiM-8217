import { useState, useEffect, useRef, useCallback } from 'react';
import { logEvent, TELEMETRY_EVENTS } from '../lib/telemetry';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export function useWebRTC(roomId) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);

  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const localStreamRef = useRef(null);

  const retryCount = useRef(0);
  const maxRetries = 3;

  const connectSignaling = useCallback((pc) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/signaling?roomId=${roomId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      retryCount.current = 0; // Reset retries on success
      logEvent(TELEMETRY_EVENTS.MEDIA_STREAM_EVENT, { action: 'signaling_connected', roomId });
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: 'offer', sdp: offer }));
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: 'answer', sdp: answer }));
        } else if (message.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));

        } else if (message.type === 'ice-candidate') {
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        } else if (message.type === 'chat-message') {
          // Fallback chat reception
          setMessages(prev => [...prev, { ...message.message, isLocal: false }]);
        }
      } catch (err) {

        console.error('Error handling signaling message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      logEvent(TELEMETRY_EVENTS.MEDIA_STREAM_EVENT, { action: 'signaling_error', roomId, error: 'Signaling server connection error' });
    };

    ws.onclose = () => {
      if (retryCount.current < maxRetries) {
        retryCount.current += 1;
        logEvent(TELEMETRY_EVENTS.MEDIA_STREAM_EVENT, { action: 'signaling_reconnect', roomId, attempt: retryCount.current });
        setTimeout(() => connectSignaling(pc), 1000 * retryCount.current);
      } else {
        setError('Signaling server connection lost after retries');
      }
    };
  }, [roomId, connectSignaling]);

  // Track states for UI

  // Chat state
  const [messages, setMessages] = useState([]);
  const [peerConnected, setPeerConnected] = useState(false);
  const dataChannelRef = useRef(null);

  const setupDataChannel = (channel) => {
    channel.onopen = () => {
      setPeerConnected(true);
      logEvent(TELEMETRY_EVENTS.MEDIA_STREAM_EVENT, { action: 'datachannel_connected', roomId });
    };
    channel.onclose = () => {
      setPeerConnected(false);
    };
    channel.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages(prev => [...prev, { ...msg, isLocal: false }]);
      } catch (e) {
        console.error("Error parsing data channel message", e);
      }
    };
  };

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: 'You',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLocal: true
    };

    setMessages(prev => [...prev, newMsg]);

    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify({
         id: newMsg.id,
         sender: 'Candidate / Interviewer', // remote sees it as this
         text: newMsg.text,
         timestamp: newMsg.timestamp
      }));
    } else {
      // Fallback to signaling socket if data channel isn't ready
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'chat-message',
          message: {
            id: newMsg.id,
            sender: 'Candidate / Interviewer',
            text: newMsg.text,
            timestamp: newMsg.timestamp
          }
        }));
      }
    }
    logEvent('interview_chat_message_sent', { roomId, messageId: newMsg.id, textLength: text.length });
  }, [roomId]);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    let isComponentMounted = true;

    // Initialize connection
    const initialize = async () => {
      try {
        // 1. Get User Media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (!isComponentMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setLocalStream(stream);
        localStreamRef.current = stream;

        // 2. Initialize Peer Connection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle incoming remote tracks
        pc.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
        };


        // Handle ICE candidates and send them to the signaling server
        pc.onicecandidate = (event) => {
          if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'ice-candidate',
              candidate: event.candidate
            }));
          }
        };

        // Data channel creation (Offer side)
        const channel = pc.createDataChannel('chat');
        dataChannelRef.current = channel;
        setupDataChannel(channel);

        // Data channel reception (Answer side)
        pc.ondatachannel = (event) => {
          dataChannelRef.current = event.channel;
          setupDataChannel(event.channel);
        };


        // Handle connection state changes for telemetry
        pc.oniceconnectionstatechange = () => {
          logEvent(TELEMETRY_EVENTS.MEDIA_STREAM_EVENT, {
            action: 'ice_connection_state_change',
            roomId,
            state: pc.iceConnectionState
          });
        };

        connectSignaling(pc);

      } catch (err) {
        console.error('Error initializing WebRTC:', err);
        logEvent(TELEMETRY_EVENTS.MEDIA_STREAM_EVENT, { action: 'media_access_error', roomId, error: err.message });
        setError(err.message || 'Error accessing media devices');
      }
    };

    initialize();

    // Cleanup function
    return () => {
      isComponentMounted = false;

      // Stop media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // Close peer connection
      if (pcRef.current) {
        pcRef.current.close();
      }

      // Close websocket
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId, connectSignaling]);

  // Toggle handlers
  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  }, [localStream]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        // Update local video element with screen share stream if needed
        if (localStreamRef.current) {
            // Keep original track to revert later
            localStreamRef.current.addTrack(screenTrack);
        }

        screenTrack.onended = () => {
           // revert to video
           toggleScreenShare();
        };

        setIsScreenSharing(true);
      } else {
        // Revert to camera
        const cameraTrack = localStream.getVideoTracks().find(t => t.label.toLowerCase().includes('camera') || !t.label.includes('screen'));
        if (pcRef.current && cameraTrack) {
           const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
           if (sender) {
             sender.replaceTrack(cameraTrack);
           }
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
    }
  }, [isScreenSharing, localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(prev => !prev);
    }
  }, [localStream]);

  return {
    localStream,
    remoteStream,
    error,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    isScreenSharing,
    toggleScreenShare,
    messages,
    sendMessage,
    peerConnected
  };
}
