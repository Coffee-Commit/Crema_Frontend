import type { Publisher } from 'openvidu-browser';
import { swapToScreen, swapToCamera, ScreenShareContext } from '@/shared/openvidu/replaceVideoTrack';
import { useScreenShareStore } from './model/screenShare.store';

export async function startScreenShare(publisher: Publisher) {
  const store = useScreenShareStore.getState();
  if (store.toggling || store.isScreenSharing) return;

  store.setToggling(true);
  try {
    const ctx = await swapToScreen(publisher);
    
    // 브라우저/OS UI에서 직접 중단 시도 대응 (리스너 정리를 위해 ctx에 저장)
    const endedListener = () => stopScreenShare(publisher);
    ctx.endedListener = endedListener;
    ctx.screenTrack?.addEventListener('ended', endedListener);
    
    store.setCtx(ctx);
    store.setIsScreenSharing(true);
  } catch (err: any) {
    // NotAllowedError, AbortError 등 권한/취소 대응
    store.setIsScreenSharing(false);
    // TODO: 토스트/로그
    console.error('Screen share start failed:', err);
  } finally {
    store.setToggling(false);
  }
}

export async function stopScreenShare(publisher: Publisher) {
  const store = useScreenShareStore.getState();
  if (store.toggling || !store.isScreenSharing || !store.ctx) return;

  store.setToggling(true);
  try {
    await swapToCamera(publisher, store.ctx);
  } catch (err: any) {
    console.error('Screen share stop failed:', err);
  } finally {
    store.clearCtx();
    store.setIsScreenSharing(false);
    store.setToggling(false);
  }
}

export async function toggleScreenShare(publisher: Publisher) {
  const { isScreenSharing } = useScreenShareStore.getState();
  return isScreenSharing ? stopScreenShare(publisher) : startScreenShare(publisher);
}