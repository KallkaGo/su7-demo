import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useInteractStore } from "@utils/Store";
import { Perf } from "r3f-perf";
import { Leva } from "leva";
import Sketch3 from "./components/Sketch";
import { CineonToneMapping } from "three";
export default function ThreeContainer() {
    const demand = useInteractStore((state) => state.demand);
    return (
        <>
            <Canvas
                frameloop={demand ? "never" : "always"}
                className="webgl"
                dpr={[1, 2]}
                camera={{
                    fov: 45,
                    near: 0.1,
                    position: [0, 2, 5],
                    far: 500,
                }}
                gl={{toneMapping:CineonToneMapping}}
            >
                {location.hash.includes("debug") ? (
                    <Perf position="top-left" />
                ) : (
                    <Leva hidden />
                )}
                <Suspense fallback={null}>
                    {/* <Sketch /> */}
                    {/* <Sketch2 /> */}
                    <Sketch3 />
                </Suspense>
            </Canvas>
        </>
    );
}
