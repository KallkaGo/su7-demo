const BD = (str: string, type: boolean = false) => {
    const _hmt: any[] = (window as any)._hmt || [];
    type
        ? _hmt.push(["_trackEvent", "event", "tap", str, ""])
        : _hmt.push(["_trackPageview", str]);
};

export { BD };
