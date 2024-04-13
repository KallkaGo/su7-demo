const Sys = {
    /**
     * 获得系统类型
     * @returns
     */
    getSystem: () => {
        const ua = navigator.userAgent.toLowerCase();
        if (/(iphone|ipad|ipod|ios)/i.test(ua)) {
            // return 'ios';
            return "mobile";
        } else if (/android/i.test(ua) || /adr/i.test(ua)) {
            // return 'android'
            return "mobile";
        } else {
            return "pc";
        }
    },
};
export default Sys;
