interface LemonSqueezy {
  Url: {
    Open: (url: string) => void;
    Close: () => void;
  };
  Setup: (options?: { eventHandler?: (event: { event: string }) => void }) => void;
  Refresh: () => void;
}

declare global {
  interface Window {
    LemonSqueezy?: LemonSqueezy;
    createLemonSqueezy?: () => void;
  }
}

export {};
