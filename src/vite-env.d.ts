/// <reference types="vite/client" />

declare module "*.glb" {
    const src: string;
    export default src;
}

declare module "*.gltf" {
    const src: string;
    export default src;
}

declare module "*.hdr" {
    const src: string;
    export default src;
}

declare type Div = HTMLDivElement;
declare type Button = HTMLButtonElement;
declare type Audio = HTMLAudioElement;
declare type Image = HTMLImageElement;
