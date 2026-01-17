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
    fcl?: any
  }
  
  // React 19.2 types
  namespace React {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      // React 19.2 specific attributes
      inert?: boolean
    }
  }
}

// Next.js 16.1.2 specific types
declare module 'next' {
  interface NextConfig {
    experimental?: {
      reactCompiler?: boolean
      ppr?: 'incremental' | boolean
      turbo?: any
      optimizePackageImports?: string[]
    }
  }
}

export {}