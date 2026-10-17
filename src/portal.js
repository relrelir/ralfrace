// One interface over the game-portal SDKs. The portal is chosen at build time:
//   vite build --mode crazygames  /  --mode poki   (see .env.crazygames, .env.poki)
// The normal web/Android build uses the 'none' provider: no ads, nothing loaded.

const PORTAL = import.meta.env.VITE_PORTAL || 'none';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const none = {
  name: 'none',
  hasRewarded: false,
  async init() {},
  loadingDone() {},
  gameplayStart() {},
  gameplayStop() {},
  happyTime() {},
  async commercialBreak() {},
  async rewardedBreak() { return false; },
};

function crazygames() {
  let sdk = null;
  // requestAd takes callbacks; wrap it so callers can await the end of the ad
  const ad = (type, onStart) => new Promise(resolve => {
    if (!sdk) { resolve(false); return; }
    sdk.ad.requestAd(type, {
      adStarted: () => onStart?.(),
      adFinished: () => resolve(true),
      adError: () => resolve(false), // also fires when no ad is available
    });
  });
  return {
    name: 'crazygames',
    get hasRewarded() { return !!sdk; },
    async init() {
      try {
        await loadScript('https://sdk.crazygames.com/crazygames-sdk-v3.js');
        sdk = window.CrazyGames.SDK;
        await sdk.init();
        sdk.game.loadingStart?.();
      } catch { sdk = null; }
    },
    loadingDone() { sdk?.game.loadingStop?.(); },
    gameplayStart() { sdk?.game.gameplayStart(); },
    gameplayStop() { sdk?.game.gameplayStop(); },
    happyTime() { sdk?.game.happytime?.(); },
    commercialBreak(onStart) { return ad('midgame', onStart); },
    rewardedBreak(onStart) { return ad('rewarded', onStart); },
  };
}

function poki() {
  let sdk = null;
  return {
    name: 'poki',
    get hasRewarded() { return !!sdk; },
    async init() {
      try {
        await loadScript('https://game-cdn.poki.com/scripts/v2/poki-sdk.js');
        sdk = window.PokiSDK;
        await sdk.init();
        if (/localhost|127\.0\.0\.1/.test(location.hostname)) sdk.setDebug(true);
      } catch { sdk = null; }
    },
    loadingDone() { sdk?.gameLoadingFinished(); },
    gameplayStart() { sdk?.gameplayStart(); },
    gameplayStop() { sdk?.gameplayStop(); },
    happyTime() { sdk?.happyTime?.(1); },
    async commercialBreak(onStart) {
      if (!sdk) return false;
      try { await sdk.commercialBreak(() => onStart?.()); return true; } catch { return false; }
    },
    async rewardedBreak(onStart) {
      if (!sdk) return false;
      try { return !!(await sdk.rewardedBreak(() => onStart?.())); } catch { return false; }
    },
  };
}

export const portal = PORTAL === 'crazygames' ? crazygames() : PORTAL === 'poki' ? poki() : none;
export const onPortal = portal.name !== 'none';
