import React, {Fragment, useCallback, useEffect, useMemo, useState} from "react";
import {
  selectAudioTrackByPeerID,
  selectIsPeerAudioEnabled,
  selectLocalPeerID,
  selectPeerMetadata,
  selectPeerNameByID,
  selectVideoTrackByID,
  selectVideoTrackByPeerID, useHMSActions,
  useHMSStore,
  selectCameraStreamByPeerID
} from "@100mslive/react-sdk";
import {
  BrbIcon,
  HandRaiseFilledIcon,
  MicOffIcon,
} from "@100mslive/react-icons";
import {
  Avatar,
  StyledVideoTile,
  useBorderAudioLevel,
  Video,
  VideoTileStats,
} from "@100mslive/roomkit-react";
import TileConnection from "./Connection/TileConnection";
import { getVideoTileLabel } from "./peerTileUtils";
import TileMenu from "./TileMenu";
import { useAppConfig } from "./AppData/useAppConfig";
import { useIsHeadless, useUISettings } from "./AppData/useUISettings";
import {APP_DATA, BAKSTAGE_LAYOUT, UI_SETTINGS} from "../common/constants";

const Tile = ({
  peerId,
  trackId,
  width,
  height,
  objectFit = "cover",
  rootCSS = {},
  containerCSS = {},
}) => {
  const trackSelector = trackId
    ? selectVideoTrackByID(trackId)
    : selectVideoTrackByPeerID(peerId);
  const track = useHMSStore(trackSelector);
  const peerName = useHMSStore(selectPeerNameByID(peerId));
  const audioTrack = useHMSStore(selectAudioTrackByPeerID(peerId));
  const localPeerID = useHMSStore(selectLocalPeerID);
  const isAudioOnly = useUISettings(UI_SETTINGS.isAudioOnly);
  const mirrorLocalVideo = useUISettings(UI_SETTINGS.mirrorLocalVideo);
  const showStatsOnTiles = useUISettings(UI_SETTINGS.showStatsOnTiles);
  const isHeadless = useIsHeadless();
  const isAudioMuted = !useHMSStore(selectIsPeerAudioEnabled(peerId));
  const isVideoMuted = !track?.enabled;
  const [isMouseHovered, setIsMouseHovered] = useState(false);
  const borderAudioRef = useBorderAudioLevel(audioTrack?.id);
  const isVideoDegraded = track?.degraded;
  const isLocal = localPeerID === peerId;

  const hmsActions = useHMSActions();
  const peerMetadata = useHMSStore(selectPeerMetadata(peerId));
  const videoTrack = useHMSStore(selectCameraStreamByPeerID(peerId));

  const label = getVideoTileLabel({
    peerName,
    track,
    isLocal,
  });
  const onHoverHandler = useCallback(event => {
    setIsMouseHovered(event.type === "mouseenter");
  }, []);
  const headlessConfig = useAppConfig("headlessConfig");
  const hideLabel = isHeadless && headlessConfig?.hideTileName;
  const isTileBigEnoughToShowStats = height >= 180 && width >= 180;
  const avatarSize = useMemo(() => {
    if (!width || !height) {
      return undefined;
    }
    if (width <= 150 || height <= 150) {
      return "small";
    } else if (width <= 300 || height <= 300) {
      return "medium";
    }
    return "large";
  }, [width, height]);

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
  const appConfig = useAppConfig();
  let layout = BAKSTAGE_LAYOUT.PORTRAIT;

  useEffect(() => {
    if (peerMetadata.layout && !appConfig.layout) {
      hmsActions.setAppData(APP_DATA.appConfig, {
        layout: peerMetadata.layout
      }, true);
      layout = peerMetadata.layout;
    }
  }, [peerMetadata, appConfig]);

  return (
    <StyledVideoTile.Root
      css={{
        width,
        height,
        padding: 0,
        ...rootCSS,
      }}
      data-testid={`participant_tile_${peerName}`}
    >
      {peerName !== undefined ? (
        <StyledVideoTile.Container
          onMouseEnter={onHoverHandler}
          onMouseLeave={onHoverHandler}
          ref={null}
          noRadius={isHeadless && Number(headlessConfig?.tileOffset) === 0}
          css={containerCSS}
        >
          {appConfig.layout === BAKSTAGE_LAYOUT.LANDSCAPE ?
              <div style={{position: 'fixed', top: '20px', fontSize: '25px', fontWeight: 600, color: 'white', textShadow: '-2px 1px 4px black'}}>
                <span>{label}</span>
              </div> :
              <div style={{position: 'fixed', top: '30px', fontSize: '50px', fontWeight: 600, color: 'white', textShadow: '-2px 1px 4px black'}}>
                <span>{label}</span>
              </div>
          }

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
                  /*style={appConfig.roomDimension === FLYX_ROOM_DIMENSION.PORTRAIT ? { background: '#202124' } : { background: '#202124', objectFit: 'cover' }}*/
                  style={{background: '#202124' }}
                  trackId={track?.id}
                  attach={isLocal ? undefined : !isAudioOnly}
                  mirror={peerId === localPeerID && track?.source === "regular"}
                  degraded={isVideoDegraded}
                  data-testid="participant_video_tile"
              />
          ) : null}

          {/*{track ? (
            <Video
              trackId={track?.id}
              attach={isLocal ? undefined : !isAudioOnly}
              mirror={
                mirrorLocalVideo &&
                peerId === localPeerID &&
                track?.source === "regular" &&
                track?.facingMode !== "environment"
              }
              degraded={isVideoDegraded}
              noRadius={isHeadless && Number(headlessConfig?.tileOffset) === 0}
              data-testid="participant_video_tile"
              css={{
                objectFit,
              }}
            />
          ) : null}*/}
          <PeerMetadata peerId={peerId} />
          <TileConnection
            hideLabel={hideLabel}
            name={label}
            isTile
            peerId={peerId}
            width={width}
          />
        </StyledVideoTile.Container>
      ) : null}
    </StyledVideoTile.Root>
  );
};

const metaStyles = { top: "$4", left: "$4" };

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

const showAudioMuted = ({ hideTileAudioMute, isHeadless, isAudioMuted }) => {
  if (!isHeadless) {
    return isAudioMuted;
  }
  return isAudioMuted && !hideTileAudioMute;
};

const getPadding = ({ isHeadless, tileOffset, hideAudioLevel }) => {
  if (!isHeadless || isNaN(Number(tileOffset))) {
    return undefined;
  }
  // Adding extra padding of 3px to ensure that the audio border is visible properly between tiles when tileOffset is 0.
  return Number(tileOffset) === 0 ? (hideAudioLevel ? 0 : 3) : undefined;
};

export default VideoTile;
