// Type declarations for Clerk JS global
export interface ClerkWindow {
  Clerk?: {
    loaded?: boolean;
    addListener: (cb: () => void) => void;
    mountSignIn: (el: HTMLElement) => void;
    mountSignUp: (el: HTMLElement) => void;
    unmountSignIn: (el: HTMLElement) => void;
    unmountSignUp: (el: HTMLElement) => void;
  };
}

declare global {
  interface Window extends ClerkWindow {}
}
