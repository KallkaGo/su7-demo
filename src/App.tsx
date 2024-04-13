import { useEffect } from "react";
import ShareMgr from "./mgr/ShareMgr";
import ThreeContainer from "./three/ThreeContainer";
import UIContainer from "./ui/UIContainer";
import BrowserUtil from "@utils/Browser";

export default function App() {
    useEffect(() => {
        ShareMgr.shared.init();
        BrowserUtil.init();
    }, []);

    return (
        <>
            {/* 3D场景层 */}
            <ThreeContainer />
            {/* UI界面层 */}
            <UIContainer />
        </>
    );
}
