import { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import { LoadWrapper } from "./style";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { IProps } from "../types";
import { useProgress } from "@react-three/drei";
import Sys from "@utils/Sys";
import { useInteractStore, useLoadedStore } from "@utils/Store";

/**
 * 加载总数
 */
const TOTAL = 24;

const Load: FC<IProps> = memo(({ emit }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const ready = useLoadedStore((state) => state.ready);

  const { contextSafe } = useGSAP();

  const [device, setDevice] = useState<"pc" | "mobile">(Sys.getSystem);

  useEffect(() => {
    const onResize = () => {
      const sys = Sys.getSystem() === "pc" ? "pc" : "mobile";
      setDevice(sys);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    ready && close();
  }, [ready]);

  const close = contextSafe(() => {
    useInteractStore.setState({ demand: false });
    gsap.to(panelRef.current, {
      opacity: 0,
      duration: 0.35,
      delay: 1,
      ease: "none",
      onComplete: () => {
        useInteractStore.setState({ audioAllowed: true });
        emit("hide-load");
        emit("show-game");
      },
    });

    useInteractStore.setState({ begin: true });
  });
  return (
    <LoadWrapper ref={panelRef}>
      <div className="loading">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="loadstr">
        <span>L</span>
        <span>O</span>
        <span>A</span>
        <span>D</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
      </div>
    </LoadWrapper>
  );
});

export default Load;
