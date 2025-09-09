import { useCallback } from 'react';
import type { Publisher } from 'openvidu-browser';
import { useScreenShareStore } from '../model/screenShare.store';
import { startScreenShare, stopScreenShare, toggleScreenShare } from '../screenShareService';

export function useScreenShare(publisher?: Publisher) {
  const { isScreenSharing, toggling } = useScreenShareStore();

  const start = useCallback(() => publisher && startScreenShare(publisher), [publisher]);
  const stop = useCallback(() => publisher && stopScreenShare(publisher), [publisher]);
  const toggle = useCallback(() => publisher && toggleScreenShare(publisher), [publisher]);

  return { isScreenSharing, toggling, start, stop, toggle };
}