import { useHMSActions, useHMSStore, selectIsConnectedToRoom, selectPeers, selectLocalPeer, selectVideoTrackByID, selectAudioTrackByID } from '@100mslive/react-sdk';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff } from 'lucide-react';

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  authToken: string;
  userName: string;
}

export default function VideoCall({ isOpen, onClose, authToken, userName }: VideoCallProps) {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    if (isOpen && authToken) {
      joinRoom();
    }
    
    return () => {
      if (isConnected) {
        leaveRoom();
      }
    };
  }, [isOpen, authToken]);

  const localVideoTrack = useHMSStore(selectVideoTrackByID(localPeer?.videoTrack));
  const localAudioTrack = useHMSStore(selectAudioTrackByID(localPeer?.audioTrack));
  
  useEffect(() => {
    if (isConnected) {
      setIsVideoMuted(!localVideoTrack?.enabled);
      setIsAudioMuted(!localAudioTrack?.enabled);
    }
  }, [isConnected, localVideoTrack, localAudioTrack]);

  const joinRoom = async () => {
    try {
      console.log('Attempting to join room with auth token for user:', userName);
      await hmsActions.join({
        userName,
        authToken
      });
      console.log('Successfully joined room');
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const leaveRoom = async () => {
    try {
      await hmsActions.leave();
      onClose();
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const toggleVideo = async () => {
    try {
      await hmsActions.setLocalVideoEnabled(isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const toggleAudio = async () => {
    try {
      await hmsActions.setLocalAudioEnabled(isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await hmsActions.setScreenShareEnabled(false);
      } else {
        await hmsActions.setScreenShareEnabled(true);
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-gray-900 rounded-2xl overflow-hidden">
        <DialogHeader className="p-4 bg-gray-800 border-b border-gray-700">
          <DialogTitle className="flex items-center justify-between text-white">
            <span className="text-lg font-semibold">Video Call - {userName}</span>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Video Grid */}
        <div className="p-6 bg-gray-900 min-h-[500px] flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {peers.map((peer) => (
              <div key={peer.id} className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                <video
                  ref={(videoElement) => {
                    if (videoElement && peer.videoTrack) {
                      hmsActions.attachVideo(peer.videoTrack, videoElement);
                    }
                  }}
                  autoPlay
                  muted={peer.isLocal}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  {peer.name} {peer.isLocal && '(You)'}
                </div>
                
                {!peer.videoTrack && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                        {peer.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium">{peer.name}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-4">
          <Button
            variant={isAudioMuted ? "primary" : "outline"}
            size="lg"
            onClick={toggleAudio}
            className={`rounded-full p-4 transition-all duration-200 ${
              isAudioMuted 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
            }`}
          >
            {isAudioMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          <Button
            variant={isVideoMuted ? "primary" : "outline"}
            size="lg"
            onClick={toggleVideo}
            className={`rounded-full p-4 transition-all duration-200 ${
              isVideoMuted 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
            }`}
          >
            {isVideoMuted ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>

          <Button
            variant={isScreenSharing ? "primary" : "outline"}
            size="lg"
            onClick={toggleScreenShare}
            className={`rounded-full p-4 transition-all duration-200 ${
              isScreenSharing 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
            }`}
          >
            {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={leaveRoom}
            className="rounded-full p-4 bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}