import React, { useRef } from "react";
import {
  selectPeers,
  useHMSStore,
  selectDominantSpeaker,
  selectLocalPeer,
} from "@100mslive/react-sdk";
import { Flex } from "@100mslive/react-ui";
import { GridCenterView, GridSidePaneView } from "../components/gridView";
import {useAppConfig} from "../components/AppData/useAppConfig";

const ActiveSpeakerView = ({showStats}) => {
  const appConfig = useAppConfig();
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);
  const latestDominantSpeakerRef = useRef(dominantSpeaker);
  // if there is no current dominant speaker latest keeps pointing to last
  if (dominantSpeaker) {
    latestDominantSpeakerRef.current = dominantSpeaker;
  }
  // show local peer if there hasn't been any dominant speaker
  const activeSpeaker = latestDominantSpeakerRef.current || localPeer;
  const numberOfSpeakers = peers.filter(peer => peer.roleName === 'video-speaker').length;
  const showSidePane =  appConfig.roomDimension === 'RD_9X16' ? false : activeSpeaker && numberOfSpeakers > 1;

  return (
    <Flex css={{ size: "100%" }}>
      <GridCenterView
        peers={[activeSpeaker]}
        maxTileCount={1}
        hideSidePane={!showSidePane}
        showStatsOnTiles={showStats}
      />
      {showSidePane && (
        <GridSidePaneView
          peers={peers.filter(peer => peer.id !== activeSpeaker.id)}
          showStatsOnTiles={showStats}
        />
      )}
    </Flex>
  );
};

export default ActiveSpeakerView;
