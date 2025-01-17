import React, { Fragment, useCallback, useState, useEffect } from "react";
import {
  Avatar,
  StyledVideoTile,
  Video,
  VideoTileStats,
  useBorderAudioLevel,
} from "@100mslive/react-ui";
import {
  useHMSActions,
  useHMSStore,
  selectIsPeerAudioEnabled,
  selectPeerMetadata,
  selectLocalPeerID,
  selectPeerNameByID,
  selectAudioTrackByPeerID,
  selectTrackByID,
  selectVideoTrackByPeerID,
  selectCameraStreamByPeerID
} from "@100mslive/react-sdk";
import {
  // MicOffIcon,
  HandRaiseFilledIcon,
  BrbIcon,
} from "@100mslive/react-icons";
import TileMenu from "./TileMenu";
import { getVideoTileLabel } from "./peerTileUtils";
// import { ConnectionIndicator } from "./Connection/ConnectionIndicator";
import { APP_DATA, FLYX_ROOM_DIMENSION, UI_SETTINGS } from "../common/constants";
import { useIsHeadless, useUISettings } from "./AppData/useUISettings";
import { useAppConfig } from "./AppData/useAppConfig";

const profileImageStyles = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translateX(-50%) translateY(-50%)',
  color: 'var(--hms-ui-colors-white)',
  fontFamily: 'var(--hms-ui-fonts-sans)',
  width: '100%',
  height: '100%',
  maxWidth: '300px',
  maxHeight: '300px',
  borderRadius: '10px',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
};
// TODO: Handle image URL not reachable scenario
const BakstageAvatar = ({ imageUrl }) => {
  return (
    imageUrl ? <div style={Object.assign({}, profileImageStyles, { backgroundImage: `url(${imageUrl})` })}></div> : <img src="/logo.svg" />
  );
}

const Tile = ({ peerId, trackId, showStatsOnTiles, width, height }) => {
  const trackSelector = trackId
    ? selectTrackByID(trackId)
    : selectVideoTrackByPeerID(peerId);
  const hmsActions = useHMSActions();
  const track = useHMSStore(trackSelector);
  const peerName = useHMSStore(selectPeerNameByID(peerId));
  const peerMetadata = useHMSStore(selectPeerMetadata(peerId));
  const audioTrack = useHMSStore(selectAudioTrackByPeerID(peerId));
  const videoTrack =  useHMSStore(selectCameraStreamByPeerID(peerId));
  const localPeerID = useHMSStore(selectLocalPeerID);
  const isAudioOnly = useUISettings(UI_SETTINGS.isAudioOnly);
  const isHeadless = useIsHeadless();
  // const isAudioMuted = !useHMSStore(selectIsPeerAudioEnabled(peerId));
  const isVideoMuted = !track?.enabled;
  const [isMouseHovered, setIsMouseHovered] = useState(false);
  // const borderAudioRef = useBorderAudioLevel(audioTrack?.id);
  const isVideoDegraded = track?.degraded;
  const isLocal = localPeerID === peerId;
  const label = getVideoTileLabel({
    peerName,
    track,
    isLocal,
  });
  const onHoverHandler = useCallback(event => {
    setIsMouseHovered(event.type === "mouseenter");
  }, []);
  const appConfig = useAppConfig();
  // console.log('peerMetadata: ', peerMetadata, appConfig);

  useEffect(() => {
    if (peerMetadata.roomDimension && !appConfig.roomDimension) {
      hmsActions.setAppData(APP_DATA.appConfig, {
        roomDimension: peerMetadata.roomDimension
      }, true);
    }
  }, [peerMetadata, appConfig]);

  // console.log('bang height: ', height);
  // const tilePadding = appConfig.roomDimension === FLYX_ROOM_DIMENSION.PORTRAIT ? {padding: '0px'} : {paddingBottom: '10px'};
  return (
    <StyledVideoTile.Root
      css={{ width, height, padding: 0 }}
      data-testid={`participant_tile_${peerName}`}
    >
      {peerName !== undefined ? (
        <StyledVideoTile.Container
          onMouseEnter={onHoverHandler}
          onMouseLeave={onHoverHandler}
          ref={null}
        >
          {/*<ConnectionIndicator isTile peerId={peerId} />
          {showStatsOnTiles ? (
            <VideoTileStats
              audioTrackID={audioTrack?.id}
              videoTrackID={track?.id}
              peerID={peerId}
            />
          ) : null}*/}

          {/*{appConfig.roomDimension === FLYX_ROOM_DIMENSION.PORTRAIT && <StyledVideoTile.Info data-testid="participant_name_onTile">
            {label}
          </StyledVideoTile.Info>
          }*/}
          <div style={{position: 'fixed', top: '30px', fontSize: '50px', fontWeight: 600, color: 'white', textShadow: '-2px 1px 4px black'}}>
            <span>{label}</span>
          </div>

          {!videoTrack ||  isVideoMuted || isVideoDegraded || isAudioOnly ? (
            <>
              {peerMetadata?.userProfileImageUrl ? <BakstageAvatar imageUrl={peerMetadata?.userProfileImageUrl} /> : <Avatar
                shape="square"
                style={{ height: '100%', width: '100%', maxWidth: '300px', maxHeight: '300px' }}
                name={peerName || ""}
                data-testid="participant_avatar_icon"
              />}
            </>
          ) : track ? (
            <Video
              style={appConfig.roomDimension === FLYX_ROOM_DIMENSION.PORTRAIT ? { background: '#202124' } : { background: '#202124', objectFit: 'cover' }}
              trackId={track?.id}
              attach={isLocal ? undefined : !isAudioOnly}
              mirror={peerId === localPeerID && track?.source === "regular"}
              degraded={isVideoDegraded}
              data-testid="participant_video_tile"
            />
          ) : null}

          {/* {(!isHeadless ||
            (isHeadless && !appConfig?.headlessConfig?.hideTileName)) && (
            <StyledVideoTile.Info data-testid="participant_name_onTile">
              {label}
            </StyledVideoTile.Info>
          )} */}
           {/*{showAudioMuted({ appConfig, isHeadless, isAudioMuted }) ? (
            <StyledVideoTile.AudioIndicator data-testid="participant_audio_mute_icon">
              <MicOffIcon />
            </StyledVideoTile.AudioIndicator>
          ) : null}*/}
          {isMouseHovered && !isHeadless && !isLocal ? (
            <TileMenu
              peerID={peerId}
              audioTrackID={audioTrack?.id}
              videoTrackID={track?.id}
            />
          ) : null}
          <PeerMetadata peerId={peerId} />
        </StyledVideoTile.Container>
      ) : null}
    </StyledVideoTile.Root>
  );
}
;

const metaStyles = { left: "20px", bottom: "20px" };

const PeerMetadata = ({ peerId }) => {
  const metaData = useHMSStore(selectPeerMetadata(peerId));
  const isHandRaised = metaData?.isHandRaised || false;
  const isBRB = metaData?.isBRBOn || false;

  return (
    <Fragment>
      {isHandRaised ? (
        <StyledVideoTile.AttributeBox
          css={metaStyles}
          data-testid="raiseHand_icon_onTile"
        >
          <HandRaiseFilledIcon width={40} height={40} />
        </StyledVideoTile.AttributeBox>
      ) : null}
      {isBRB ? (
        <StyledVideoTile.AttributeBox
          css={metaStyles}
          data-testid="brb_icon_onTile"
        >
          <BrbIcon width={40} height={40} />
        </StyledVideoTile.AttributeBox>
      ) : null}
    </Fragment>
  );
};

const VideoTile = React.memo(Tile);

const showAudioMuted = ({ appConfig, isHeadless, isAudioMuted }) => {
  if (!isHeadless) {
    return isAudioMuted;
  }
  const hide = appConfig?.headlessConfig?.hideTileAudioMute;
  return isAudioMuted && !hide;
};

const getPadding = ({ isHeadless, appConfig }) => {
  const offset = appConfig?.headlessConfig?.tileOffset;
  if (!isHeadless || typeof offset !== "number") {
    return undefined;
  }
  return offset === 0 ? 0 : undefined;
};

export default VideoTile;
