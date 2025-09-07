import { create } from 'zustand';
import type { ScreenShareContext } from '@/shared/openvidu/replaceVideoTrack';

type ScreenShareState = {
  isScreenSharing: boolean;
  toggling: boolean;
  ctx?: ScreenShareContext;
  setIsScreenSharing(v: boolean): void;
  setToggling(v: boolean): void;
  setCtx(ctx: ScreenShareContext): void;
  clearCtx(): void;
};

export const useScreenShareStore = create<ScreenShareState>(set => ({
  isScreenSharing: false,
  toggling: false,
  ctx: undefined,
  setIsScreenSharing: v => set({ isScreenSharing: v }),
  setToggling: v => set({ toggling: v }),
  setCtx: ctx => set({ ctx }),
  clearCtx: () => set({ ctx: undefined }),
}));