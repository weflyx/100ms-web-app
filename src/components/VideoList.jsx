import React, { Fragment, useEffect, useState } from "react";
import {
  selectLocalPeerID,
  useHMSStore,
  useVideoList,
} from "@100mslive/react-sdk";
import { StyledVideoList, useTheme } from "@100mslive/roomkit-react";
import { Pagination } from "./Pagination";
import ScreenshareTile from "./ScreenshareTile";
import VideoTile from "./VideoTile";
import useSortedPeers from "../common/useSortedPeers";
import { useAppConfig } from "./AppData/useAppConfig";
import { useIsHeadless, useUISettings } from "./AppData/useUISettings";
import { UI_SETTINGS } from "../common/constants";
import { FLYX_ROOM_DIMENSION } from "../common/constants";
import {ROLES} from "../common/roles";

const List = ({
  maxTileCount,
  peers,
  maxColCount,
  maxRowCount,
  includeScreenShareForPeer,
  variant // active-speaker, vertical, horizontal, grid
}) => {
  const { aspectRatio } = useTheme();
  const tileOffset = useAppConfig("headlessConfig", "tileOffset");
  const isHeadless = useIsHeadless();
  const hideLocalVideo = useUISettings(UI_SETTINGS.hideLocalVideo);
  const localPeerId = useHMSStore(selectLocalPeerID);
  let sortedPeers = useSortedPeers({ peers, maxTileCount });
  if (hideLocalVideo && sortedPeers.length > 1) {
    sortedPeers = filterPeerId(sortedPeers, localPeerId);
  }
  const { ref, pagesWithTiles } = useVideoList({
    peers: sortedPeers,
    maxTileCount,
    maxColCount,
    maxRowCount,
    includeScreenShareForPeer,
    aspectRatio,
    offsetY: getOffset({ isHeadless, tileOffset }),
  });
  const [page, setPage] = useState(0);
  useEffect(() => {
    // currentPageIndex should not exceed pages length
    if (page >= pagesWithTiles.length) {
      setPage(0);
    }
  }, [pagesWithTiles.length, page]);
  // console.log('maxTileCount: ', maxTileCount);
  // console.log('bang: pagesWithTiles: ', pagesWithTiles);
  // const tileHeight = appConfig.roomDimension === FLYX_ROOM_DIMENSION.PORTRAIT ? "100vh": (variant === "active-speaker" ? "100vh" : "17vh");
  const videoSpeakers = peers.filter(peer => peer.roleName === ROLES.VIDEO_SPEAKER);
  const tileWidth = variant === "active-speaker" ? "100vw" : videoSpeakers.length > 3 ? "50%" : "100%";
  const tileHeight = variant === "active-speaker" ? "100vh" :
      ((videoSpeakers.length >= 1 && videoSpeakers.length < 4) ? "33vh" :
          (videoSpeakers.length >= 4 && videoSpeakers.length < 7) ? "28vh" : "16.7vh");
  return (
    <StyledVideoList.Root ref={ref}>
      <StyledVideoList.Container
        css={{ flexWrap: "wrap", placeContent: "center" }}
      >
        {pagesWithTiles && pagesWithTiles.length > 0
          ? pagesWithTiles[page]?.map(tile => {
              if (tile.width === 0 || tile.height === 0) {
                return null;
              }
              return (
                <Fragment key={tile.track?.id || tile.peer.id}>
                  {/*{tile.track?.source === "screen" ? (
                    <ScreenshareTile
                      width={tile.width}
                      height={tile.height}
                      peerId={tile.peer.id}
                    />
                  ) : (
                    <VideoTile
                      width={tile.width}
                      height={tile.height}
                      peerId={tile.peer?.id}
                      trackId={tile.track?.id}
                    />
                  )}*/}
                  {videoSpeakers.map((speaker) =>
                      (
                          <VideoTile
                              key={speaker.videoTrack || speaker.id}
                              width={tileWidth}
                              height={tileHeight}
                              // width={maxTileCount === 1 ? '100vw' : tile.width}
                              // height={maxTileCount === 1 ? '100vh' : tile.height}
                              peerId={speaker.id}
                              trackId={speaker.videoTrack}
                          />
                      )
                  )}
                </Fragment>
              );
            })
          : null}
      </StyledVideoList.Container>
      {/*{!isHeadless && pagesWithTiles.length > 1 ? (
        <Pagination
          page={page}
          setPage={setPage}
          numPages={pagesWithTiles.length}
        />
      ) : null}*/}
    </StyledVideoList.Root>
  );
};

const VideoList = React.memo(List);

/**
 * returns a new array of peers with the peer with peerId removed,
 * keeps the reference same if peer is not found
 */
function filterPeerId(peers, peerId) {
  const oldPeers = peers; // to keep the reference same if peer is not found
  let foundPeerToFilterOut = false;
  peers = [];
  for (let i = 0; i < oldPeers.length; i++) {
    if (oldPeers[i].id === peerId) {
      foundPeerToFilterOut = true;
    } else {
      peers.push(oldPeers[i]);
    }
  }
  if (!foundPeerToFilterOut) {
    peers = oldPeers;
  }
  return peers;
}

const getOffset = ({ tileOffset, isHeadless }) => {
  if (!isHeadless || isNaN(Number(tileOffset))) {
    return 32;
  }
  return Number(tileOffset);
};

export default VideoList;
