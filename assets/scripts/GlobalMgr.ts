import { Node, Prefab, _decorator, assetManager, find, instantiate } from 'cc';
import { AudioMgr } from '../core_tgx/base/AudioMgr';
import { AdvertMgr } from '../core_tgx/base/ad/AdvertMgr';
const { ccclass, property } = _decorator;

@ccclass('GlobalMgr')
export class GlobalMgr {
    private static _instance: GlobalMgr | null = null;
    public static get instance(): GlobalMgr {
        if (!this._instance) this._instance = new GlobalMgr();
        return this._instance;
    }

    //初始化__woso 挂载到window对象上
    public initilize() {
        window.__woso = {
            SoundMr: {
                pauseAll: () => {
                    GlobalMgr.instance.pauseAllSounds();
                },
                resumeAll: () => {
                    GlobalMgr.instance.resumeAllSounds();
                }
            },
            TargetedAds: {
                open: () => {
                    GlobalMgr.instance.openAd();
                },
                clos: () => {
                    GlobalMgr.instance.closeAd();
                }
            },
            Fps: {
                setfps: (value) => {
                    GlobalMgr.instance.setfps(value);
                }
            }
        };
    }

    // 暂停所有声音
    pauseAllSounds() {
        // console.log("暂停游戏所有声音 oh~~~~~~~~~~~");
        AudioMgr.inst.toggleBgMusic(false);
        AudioMgr.inst.toggleSoundEffects(false);
    }
    // 恢复所有声音
    resumeAllSounds() {
        // console.log("恢复游戏所有声音 emo~~~~~~~~~~");
        AudioMgr.inst.toggleBgMusic(true);
        AudioMgr.inst.toggleSoundEffects(true);
    }

    //开启广告
    openAd() {
        console.log("开启广告");
        AdvertMgr.instance.openAd = true;
    }

    //关闭广告
    closeAd() {
        console.log("关闭广告");
        AdvertMgr.instance.openAd = false;
    }

    //设置帧率
    setfps(value) {
        console.log("设置帧率:", value);
    }

    timeTest() {
        setTimeout(() => {
            window.__woso.SoundMr.pauseAll();
        }, 2000);
    }

}
