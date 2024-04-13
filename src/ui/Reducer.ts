interface PageState {
    load: boolean;
    game: boolean;
}

type PageActionType =
    // 加载页
    | "show-load"
    | "hide-load"
    // 游戏操作页
    | "show-game"
    | "hide-game"
    // 可以播放音乐
    | "allow-audio"
    | "mute"
    | "unmute";

interface PageAction {
    type: PageActionType;
    payload?: any;
}

const reducer = (state: PageState, action: PageAction) => {
    const { type, payload } = action;
    switch (type) {
        case "show-load":
            return { ...state, load: true };
        case "hide-load":
            return { ...state, load: false };
        case "show-game":
            return { ...state, game: true };
        case "hide-game":
            return { ...state, game: false };
        default:
            return state;
    }
};

const initialState = {
    load: true,
    game: false,
};
export type { PageActionType };
export { reducer, initialState };
