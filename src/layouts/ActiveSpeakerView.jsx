import React, { useRef } from "react";
import {
  selectPeers,
  useHMSStore,
  selectDominantSpeaker,
  selectLocalPeer,
  selectLocalPeerID,
  selectPeerScreenSharing,
  selectPeerSharingVideoPlaylist,
  selectIsSomeoneScreenSharing
} from "@100mslive/react-sdk";
import { Flex } from "@100mslive/react-ui";
import { GridCenterView, GridSidePaneView } from "../components/gridView";
import {useAppConfig} from "../components/AppData/useAppConfig";
import { FLYX_ROOM_DIMENSION } from "../common/constants";
import { ROLES } from "../common/roles";
import { ScreenShareComponent } from "./screenShareView";

const ActiveSpeakerView = ({showStats}) => {
  const appConfig = useAppConfig();
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);
  const localPeerID = useHMSStore(selectLocalPeerID);
  const peerPresenting = useHMSStore(selectPeerScreenSharing);
  const peerSharingPlaylist = useHMSStore(selectPeerSharingVideoPlaylist);
  const isSomeonePresenting = useHMSStore(selectIsSomeoneScreenSharing);

  const latestDominantSpeakerRef = useRef(dominantSpeaker);
  // if there is no current dominant speaker latest keeps pointing to last
  if (dominantSpeaker) {
    latestDominantSpeakerRef.current = dominantSpeaker;
  }
  // show local peer if there hasn't been any dominant speaker
  const videoSpeakers = peers.filter(peer => peer.roleName === ROLES.VIDEO_SPEAKER);
  const numberOfSpeakers = videoSpeakers.length;
  const activeSpeaker = latestDominantSpeakerRef.current || videoSpeakers.find(s => s.videoTrack) || localPeer;
  console.log('videoSpeakers: ', videoSpeakers, activeSpeaker);
  const showSidePane =  appConfig.roomDimension === FLYX_ROOM_DIMENSION.PORTRAIT ? false : activeSpeaker && numberOfSpeakers > 1;

  const amIPresenting = localPeerID === peerPresenting?.id;

  return (
    <Flex css={{ size: "100%" }}>
      {isSomeonePresenting ? <ScreenShareComponent
        showStats={showStats}
        amIPresenting={amIPresenting}
        peerPresenting={peerPresenting}
        peerSharingPlaylist={peerSharingPlaylist}
      /> : <GridCenterView
        peers={[activeSpeaker]}
        maxTileCount={1}
        hideSidePane={!showSidePane}
        showStatsOnTiles={showStats}
      />}
      {showSidePane && (
        <GridSidePaneView
          peers={isSomeonePresenting ? peers : peers.filter(peer => peer.id !== activeSpeaker.id)}
          showStatsOnTiles={showStats}
        />
      )}
    </Flex>
  );
};

export default ActiveSpeakerView;
