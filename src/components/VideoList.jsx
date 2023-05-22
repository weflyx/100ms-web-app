import React, { useEffect, useState } from "react";
import { Freeze } from "react-freeze";
import { StyledVideoList, getLeft, useTheme } from "@100mslive/react-ui";
import { useVideoList } from "@100mslive/react-sdk";
import VideoTile from "./VideoTile";
import ScreenshareTile from "./ScreenshareTile";
import { FeatureFlags } from "../services/FeatureFlags";
import { Pagination } from "./Pagination";
import { useAppConfig } from "./AppData/useAppConfig";
import { useIsHeadless } from "./AppData/useUISettings";
import { FLYX_ROOM_DIMENSION } from "../common/constants";

const List = ({
  maxTileCount,
  peers,
  showStatsOnTiles,
  maxColCount,
  maxRowCount,
  includeScreenShareForPeer,
  variant // active-speaker, vertical, horizontal, grid
}) => {
  const { aspectRatio } = useTheme();
  const appConfig = useAppConfig();
  const isHeadless = useIsHeadless();
  const { ref, pagesWithTiles } = useVideoList({
    peers,
    maxTileCount,
    maxColCount,
    maxRowCount,
    includeScreenShareForPeer,
    aspectRatio,
    offsetY: getOffset({ isHeadless, appConfig })
  });
  const [page, setPage] = useState(0);
  useEffect(() => {
    // currentPageIndex should not exceed pages length
    if (page >= pagesWithTiles.length) {
      setPage(0);
    }
  }, [pagesWithTiles.length, page]);
  const useFreeze = FeatureFlags.freezeVideoList();

  // console.log('maxTileCount: ', maxTileCount);
  // console.log('bang: pagesWithTiles: ', pagesWithTiles);
  // const tileHeight = appConfig.roomDimension === FLYX_ROOM_DIMENSION.PORTRAIT ? "100vh": (variant === "active-speaker" ? "100vh" : "17vh");
  const tileWidth = variant === "active-speaker" ? "100vw" : "50%";
  const tileHeight = variant === "active-speaker" ? "100vh" : "16.7vh";

  return (
    <StyledVideoList.Root ref={ref}>
      <StyledVideoList.Container>
        {pagesWithTiles && pagesWithTiles.length > 0
          ? pagesWithTiles.map((tiles, pageNo) => (
              <Freeze freeze={useFreeze && page !== pageNo} key={pageNo}>
                <StyledVideoList.View
                  css={{
                    left: getLeft(pageNo, page),
                    transition: "left 0.3s ease-in-out",
                    placeContent: appConfig.roomDimension === FLYX_ROOM_DIMENSION.LANDSCAPE && variant === "vertical" ? "flex-start": "center"
                  }}
                  data-testid="video-list-container"
                >
                  {tiles.map((tile, i) =>
                    tile.track?.source === "screen" ? (
                      <ScreenshareTile
                        showStatsOnTiles={showStatsOnTiles}
                        key={tile.track.id}
                        width={tile.width}
                        height={tile.height}
                        peerId={tile.peer.id}
                      />
                    ) : (
                      <VideoTile
                        showStatsOnTiles={showStatsOnTiles}
                        key={tile.track?.id || tile.peer.id}
                        width={tileWidth}
                        height={tileHeight}
                        // width={maxTileCount === 1 ? '100vw' : tile.width}
                        // height={maxTileCount === 1 ? '100vh' : tile.height}
                        peerId={tile.peer?.id}
                        trackId={tile.track?.id}
                      />
                    )
                  )}
                </StyledVideoList.View>
              </Freeze>
            ))
          : null}
      </StyledVideoList.Container>
      {pagesWithTiles.length > 1 ? (
        <Pagination
          page={page}
          setPage={setPage}
          numPages={pagesWithTiles.length}
        />
      ) : null}
    </StyledVideoList.Root>
  );
};

const VideoList = React.memo(List);

const getOffset = ({ appConfig, isHeadless }) => {
  const offset = appConfig?.headlessConfig?.tileOffset;
  if (!isHeadless || typeof offset !== "number") {
    return 32;
  }
  return offset;
};

export default VideoList;
