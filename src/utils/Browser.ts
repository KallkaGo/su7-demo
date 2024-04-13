import { useInteractStore } from "./Store";

const dom = document as any;
let key = "hidden";
// const hiddenListeners: (() => void)[] = [];
// const showListeners: (() => void)[] = [];
const onWinChange = (e: any) => {
    // console.log(e.type, dom[key])
    if (dom[key] || e.type == "focusout" || e.type == "blur") {
        useInteractStore.setState({ browserHidden: true });
    } else {
        useInteractStore.setState({ browserHidden: false });
    }
};

let inited = false;
const BrowserUtil = {
    init: () => {
        if (inited) return;
        inited = true;

        if ("hidden" in dom) {
            key = "hidden";
            window.addEventListener("visibilitychange", onWinChange);
        } else if ("mozHidden" in dom) {
            key = "mozHidden";
            window.addEventListener("mozvisibilitychange", onWinChange);
        } else if ("webkitHidden" in dom) {
            key = "webkitHidden";
            window.addEventListener("webkitvisibilitychange", onWinChange);
        } else if ("msHidden" in dom) {
            key = "msHidden";
            window.addEventListener("msvisibilitychange", onWinChange);
        } else if ("onfocusin" in dom) {
            window.addEventListener("focusin", onWinChange);
            window.addEventListener("focusout", onWinChange);
        } else {
            window.addEventListener("pageshow", onWinChange);
            window.addEventListener("pagehide", onWinChange);
            window.addEventListener("focus", onWinChange);
            window.addEventListener("blur", onWinChange);
        }
    },
};

export default BrowserUtil;
