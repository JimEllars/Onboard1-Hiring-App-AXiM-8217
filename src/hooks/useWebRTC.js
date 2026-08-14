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
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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
    toggleVideo
  };
}
