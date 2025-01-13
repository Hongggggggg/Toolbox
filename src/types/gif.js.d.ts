declare module 'gif.js' {
  export interface GifOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    debug?: boolean;
  }

  export interface GifFrame {
    delay: number;
    copy?: boolean;
    dispose?: number;
  }

  export default class GIF {
    constructor(options: GifOptions);
    addFrame(image: HTMLImageElement | HTMLCanvasElement, options?: Partial<GifFrame>): void;
    on(event: 'progress' | 'finished' | 'error', callback: (data: any) => void): void;
    render(): void;
    setOptions(options: Partial<GifOptions>): void;
    abort(): void;
    options: GifOptions;
  }
} 