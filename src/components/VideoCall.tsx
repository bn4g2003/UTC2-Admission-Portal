import { useHMSActions, useHMSStore, selectIsConnectedToRoom, selectPeers, selectLocalPeer, selectVideoTrackByID, selectAudioTrackByID } from '@100mslive/react-sdk';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor,
  MonitorOff 
} from 'lucide-react';

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  authToken: string;
  userName: string;
}

export default function VideoCall({ isOpen, onClose, roomId, authToken, userName }: VideoCallProps) {  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  useEffect(() => {
    if (isOpen && authToken && roomId) {
      joinRoom();
    }
    
    return () => {
      if (isConnected) {
        leaveRoom();
      }
    };
  }, [isOpen, authToken, roomId]);
  // Sync local track states with HMS store
  // Import these selectors at the top if not already imported:
  // import { selectVideoTrackByID, selectAudioTrackByID } from '@100mslive/react-sdk';

  const videoTrack = useHMSStore(localPeer?.videoTrack ? selectVideoTrackByID(localPeer.videoTrack) : () => undefined);
  const audioTrack = useHMSStore(localPeer?.audioTrack ? selectAudioTrackByID(localPeer.audioTrack) : () => undefined);

  useEffect(() => {
    if (isConnected && localPeer) {
      setIsVideoMuted(!videoTrack?.enabled);
      setIsAudioMuted(!audioTrack?.enabled);
    }
  }, [isConnected, localPeer, videoTrack, audioTrack]);
  const joinRoom = async () => {
    try {
      await hmsActions.join({
        authToken,
        userName,
        settings: {
          isAudioMuted: false,
          isVideoMuted: false
        }
      });
      
      // Set initial states after joining
      setIsVideoMuted(false);
      setIsAudioMuted(false);
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
    if (isScreenSharing) {
      await hmsActions.setScreenShareEnabled(false);
    } else {
      await hmsActions.setScreenShareEnabled(true);
    }
    setIsScreenSharing(!isScreenSharing);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>Video Call - {roomId}</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Video Grid */}
        <div className="flex-1 p-4 bg-gray-900 min-h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {peers.map((peer) => (
              <div key={peer.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
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
                
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {peer.name} {peer.isLocal && '(You)'}
                </div>
                
                {!peer.videoTrack && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        {peer.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm">{peer.name}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t bg-white flex items-center justify-center gap-4">
          <Button
            variant={isAudioMuted ? "primary" : "outline"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full p-3"
          >
            {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoMuted ? "primary" : "outline"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full p-3"
          >
            {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "primary" : "outline"}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full p-3"
          >
            {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={leaveRoom}
            className="rounded-full p-3"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
