import * as dd from "dingtalk-jsapi";
import wx from "@wtto00/jweixin-esm";
import { BD } from "@/utils/BDTrack";

export default class ShareMgr {
    private static __ins: ShareMgr;
    public static get shared() {
        if (!this.__ins) {
            this.__ins = new ShareMgr();
        }
        return this.__ins;
    }
    constructor() {
        this.url = location.origin + location.pathname;
        if (this.url.indexOf("/src/app")) {
            this.url = this.url.replace("/src/app", "");
        }

        this.title = "";
        this.desc =
            "";
        this.timelineTitle = "";
        this.image = new Image().src = '';
    }

    private url: string;
    private image: string;
    private title: string;
    private desc: string;
    private timelineTitle: string;

    init() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf("micromessenger") > -1) {
            this.initWechat();
        }

        if (ua.indexOf("dingtalk") > -1) {
            this.initDingtalk();
        }
    }

    initWechat() {
        const body = new FormData();
        body.append("type", "signature");
        body.append("url", window.location.href.split("#")[0]);
        body.append("weixinidx", "1");
        // TODO：这里需要填写自己的服务器地址
        const url = "url" + Math.random();
        fetch(url, { method: "POST", body, cache: "no-cache" })
            .then(res => {
                console.log(res);
                if (res.status == 200) {
                    return res.json();
                }
            })
            .then(data => {
                console.log(data);
                wx.config({
                    debug: false,
                    appId: data.appid,
                    timestamp: data.timestamp,
                    nonceStr: data.nonceStr,
                    signature: data.signature,
                    jsApiList: [
                        "onMenuShareTimeline",
                        "onMenuShareAppMessage",
                        "onMenuShareQQ",
                        "onMenuShareWeibo",
                        "onMenuShareQZone",
                        "hideMenuItems",
                        "showMenuItems",
                        "hideAllNonBaseMenuItem",
                        "showAllNonBaseMenuItem",
                        "translateVoice",
                        "startRecord",
                        "stopRecord",
                        "onVoiceRecordEnd",
                        "playVoice",
                        "onVoicePlayEnd",
                        "pauseVoice",
                        "stopVoice",
                        "uploadVoice",
                        "downloadVoice",
                        "chooseImage",
                        "previewImage",
                        "uploadImage",
                        "downloadImage",
                        "getNetworkType",
                        "openLocation",
                        "getLocation",
                        "hideOptionMenu",
                        "showOptionMenu",
                        "closeWindow",
                        "scanQRCode",
                        "chooseWXPay",
                        "openProductSpecificView",
                        "addCard",
                        "chooseCard",
                        "openCard",
                    ],
                });
            })
            .catch(err => {
                console.log(err);
            });

        wx.ready(() => {
            wx.onMenuShareAppMessage({
                title: this.title,
                link: this.url,
                desc: this.desc,
                imgUrl: this.image,
                success: () => {
                    BD("分享成功-wx", true);
                },
                cancel: () => {
                    BD("分享取消-wx", true);
                },
            });

            wx.onMenuShareTimeline({
                title: this.timelineTitle, // 朋友圈文案
                imgUrl: this.image,
                link: this.url,
                success: () => {
                    BD("分享成功-pyq", true);
                },
                cancel: () => {
                    BD("分享取消-pyq", true);
                },
            });
        });
    }

    initDingtalk() {
        dd.ready(() => {
            dd.biz.navigation.setRight({
                show: true, // 控制按钮显示， true 显示， false 隐藏， 默认true
                control: true, // 是否控制点击事件，true 控制，false 不控制， 默认false
                text: "分享", // 控制显示文本，空字符串表示显示默认文本
                onSuccess: () => {
                    dd.biz.util.share({
                        type: 0, // 分享类型，0:全部组件 默认； 1:只能分享到钉钉；2:不能分享，只有刷新按钮
                        url: this.url,
                        title: this.title,
                        content: this.desc,
                        image: this.image,
                        onSuccess: () => {
                            BD("分享成功-dd", true);
                        },
                        onFail: () => {
                            BD("分享取消-dd", true);
                        },
                    } as any);
                },

                // onFail: function (err) { }
            });
        });
        dd.error(function (error: any) {
            alert("dd error: " + JSON.stringify(error));
        });
    }
}
