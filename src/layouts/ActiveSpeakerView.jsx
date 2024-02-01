import React, { useRef } from "react";
import {
  selectDominantSpeaker,
  selectPeers,
  useHMSStore,
  selectLocalPeerID,
  selectPeerScreenSharing,
  selectPeerSharingVideoPlaylist,
  selectIsSomeoneScreenSharing,
  selectLocalPeer
} from "@100mslive/react-sdk";
import { Box, Flex } from "@100mslive/roomkit-react";
import {GridCenterView, GridSidePaneView} from "../components/gridView";
import VideoTile from "../components/VideoTile";
import {useAppConfig} from "../components/AppData/useAppConfig";
import { FLYX_ROOM_DIMENSION, BAKSTAGE_LAYOUT } from "../common/constants";
import { ROLES } from "../common/roles";
import { ScreenShareComponent } from "./screenShareView";
//import {localPeer} from "@100mslive/hms-video-store/dist/test/fakeStore";

const ActiveSpeakerView = () => {
  const appConfig = useAppConfig();
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);
  const latestDominantSpeakerRef = useRef(dominantSpeaker);
  const peers = (useHMSStore(selectPeers) || []).filter(
    peer =>
      peer.videoTrack || peer.audioTrack || peer.auxiliaryTracks.length > 0
  );
  const localPeerID = useHMSStore(selectLocalPeerID);
  const peerPresenting = useHMSStore(selectPeerScreenSharing);
  const peerSharingPlaylist = useHMSStore(selectPeerSharingVideoPlaylist);
  const isSomeonePresenting = useHMSStore(selectIsSomeoneScreenSharing);
  // if there is no current dominant speaker latest keeps pointing to last
  if (dominantSpeaker) {
    latestDominantSpeakerRef.current = dominantSpeaker;
  }
/*  if (peers.length === 0) {
    return null;
  }
  // show local peer if there hasn't been any dominant speaker
  const activeSpeaker = latestDominantSpeakerRef.current || peers[0];
  const showSidePane = false;//activeSpeaker && peers.length > 1;
  const amIPresenting = localPeerID === peerPresenting?.id;*/

  // show local peer if there hasn't been any dominant speaker
  const videoSpeakers = peers.filter(peer => peer.roleName === ROLES.VIDEO_SPEAKER);
  const numberOfSpeakers = videoSpeakers.length;
  let activeSpeaker;
  if (latestDominantSpeakerRef.current) {
    if (videoSpeakers.find(s => s.id === latestDominantSpeakerRef.current.id)) {
      activeSpeaker = latestDominantSpeakerRef.current;
    }
  }
  if (!activeSpeaker) {
    activeSpeaker = videoSpeakers.find(s => s.videoTrack) || videoSpeakers[0] || localPeer;
  }
  // console.log('videoSpeakers: ', videoSpeakers, activeSpeaker, latestDominantSpeakerRef.current);
  //const showSidePane = appConfig.layout === FLYX_ROOM_DIMENSION.PORTRAIT ? false : activeSpeaker && numberOfSpeakers > 1;
  const showSidePane = false;

  const amIPresenting = localPeerID === peerPresenting?.id;

  return (
    /*<Flex css={{ size: "100%", "@lg": { flexDirection: "column" } }}>
      <Box css={{ flex: "1 1 0 " }}>
        <VideoTile peerId={activeSpeaker.id} width="100%" height="100%" />
      </Box>
      {showSidePane && (
        <GridSidePaneView
          peers={peers.filter(peer => peer.id !== activeSpeaker.id)}
        />
      )}
    </Flex>*/
      <Flex css={{ size: "100%" }}>
        {isSomeonePresenting ? <ScreenShareComponent
            showStats={false}
            amIPresenting={amIPresenting}
            peerPresenting={peerPresenting}
            peerSharingPlaylist={peerSharingPlaylist}
        /> : <GridCenterView
            peers={[activeSpeaker]}
            maxTileCount={1}
            hideSidePane={!showSidePane}
            showStatsOnTiles={false}
        />}
        {showSidePane && (
            <GridSidePaneView
                peers={isSomeonePresenting ? peers : peers.filter(peer => peer.id !== activeSpeaker.id)}
                showStatsOnTiles={false}
            />
        )}
      </Flex>
  );
};

export default ActiveSpeakerView;
