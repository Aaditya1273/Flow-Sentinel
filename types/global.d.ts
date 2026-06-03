// Global type definitions for Flow Sentinel - React 19.2 & Next.js 16.1.2

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

// Flow types
declare global {
  interface Window {
    fcl?: {
      query: (args: { cadence: string; args?: (arg: FCLArg, t: FCLTypes) => unknown[] }) => Promise<unknown>
      mutate: (args: { cadence: string; args?: (arg: FCLArg, t: FCLTypes) => unknown[]; payer?: unknown; proposer?: unknown; authorizations?: unknown[]; limit?: number }) => Promise<string>
      authenticate: () => Promise<void>
      unauthenticate: () => Promise<void>
      currentUser: {
        subscribe: (cb: (user: Record<string, unknown>) => void) => () => void;
        addr?: string;
        loggedIn?: boolean;
      } | undefined
      tx: (id: string) => { onceSealed: () => Promise<unknown> }
      send: (ix: unknown[]) => Promise<unknown>
      decode: (result: unknown) => Promise<unknown>
      block: (opts: { sealed: boolean }) => Promise<{ height: number; timestamp?: string }>
      getEventsAtBlockHeightRange: (eventType: string, startHeight: number, endHeight: number) => unknown
      config: (opts: Record<string, string>) => void
    }
  }
  
  // React 19.2 types
  namespace React {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      // React 19.2 specific attributes
      inert?: boolean
    }
  }
}

// Module declaration for @onflow/fcl (limited TS support)
declare module '@onflow/fcl' {
  export function query(args: {
    cadence: string
    args?: (arg: FCLArg, t: FCLTypes) => unknown[]
  }): Promise<unknown>

  export function mutate(args: {
    cadence: string
    args?: (arg: FCLArg, t: FCLTypes) => unknown[]
    payer?: unknown
    proposer?: unknown
    authorizations?: unknown[]
    limit?: number
  }): Promise<string>

  export function authenticate(): Promise<void>
  export function unauthenticate(): Promise<void>

  export const currentUser: {
    subscribe: (cb: (user: Record<string, unknown>) => void) => () => void
    addr?: string
    loggedIn?: boolean
  }

  export function tx(id: string): {
    onceSealed: () => Promise<unknown>
  }

  export function send(ix: unknown[]): Promise<unknown>
  export function decode(result: unknown): Promise<unknown>

  export function block(opts: { sealed: boolean }): Promise<{
    height: number
    timestamp?: string
  }>

  export function getEventsAtBlockHeightRange(
    eventType: string,
    startHeight: number,
    endHeight: number
  ): unknown

  export function config(opts: Record<string, string>): void
}

// Next.js 16.1.2 specific types
declare module 'next' {
  interface NextConfig {
    experimental?: {
      reactCompiler?: boolean
      ppr?: 'incremental' | boolean
      turbo?: {
        resolveAlias?: Record<string, string>
        loaders?: Record<string, unknown[]>
      }
      optimizePackageImports?: string[]
    }
  }
}

export {}