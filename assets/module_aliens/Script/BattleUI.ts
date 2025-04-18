import { _decorator, Component, find, Label, Node, NodeEventType } from 'cc';
import { UserManager } from './Manager/UserMgr';
import { GameUtil } from './GameUtil';
import { tgxUIMgr } from '../../core_tgx/tgx';
import { UI_BattleGambit } from '../../scripts/UIDef';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { GlobalConfig } from '../../start/Config/GlobalConfig';
import { AdvertMgr } from '../../core_tgx/base/ad/AdvertMgr';
const { ccclass, property } = _decorator;

@ccclass('BattleUI')
export class BattleUI extends Component {

    @property(Node)
    public renderAd: Node = null; 
    @property(Label)
    public lbRenderFreeCount: Label = null;

    @property(Node)
    public radarAd: Node = null; 
    @property(Label)
    public lbRadarFreeCount: Label = null;

    protected onLoad(): void {
        this.registerListener();
    }

    protected onDestroy(): void {
        this.unregisterListener();
    }

    start() {
        this.updateBtnsCountUI();
    }

    private registerListener() {
        EventDispatcher.instance.on(GameEvent.EVENT_REFRESH_PLAYER_INFO,this.updateBtnsCountUI,this);

        const btnRender = find('Canvas/GameUI/BattleUI/BottomBtns/BtnRender')!;
        const btnProbe = find('Canvas/GameUI/BattleUI/BottomBtns/BtnProbe')!;

        btnRender.on(NodeEventType.TOUCH_END, () => this.onScreenShot(), this);
        btnProbe.on(NodeEventType.TOUCH_END, () => this.onRadar(), this);
    }

    private updateBtnsCountUI(){
        const {radarFreeCount,freeScreenShotCount} = UserManager.instance.userModel;
        this.lbRenderFreeCount.string = `${freeScreenShotCount}`;
        this.lbRadarFreeCount.string = `${radarFreeCount}`;

        this.renderAd.active = false; //默认隐藏
        this.radarAd.active = false; //默认隐藏

        if(radarFreeCount <= 0){
            this.lbRadarFreeCount.string = '';
            this.radarAd.active = true; 
        }
        
        if(freeScreenShotCount <= 0){
            this.lbRenderFreeCount.string = '';
            this.renderAd.active = true;
        }
    }

    private onScreenShot(){
        this.useAbility(
            UserManager.instance.userModel.freeScreenShotCount,
            (count) => UserManager.instance.reduceFreeScreenShotCount(count),
            GameEvent.EVENT_CAMERA_SCREENSHOT
        );
    }

    private onRadar(){
        this.useAbility(
            UserManager.instance.userModel.radarFreeCount,
            (count) => UserManager.instance.reduceRadarFreeCount(count),
            GameEvent.EVENT_CAMERA_SCREENSHOT_RADAR
        );
    }

    private useAbility(freeCount: number,reduceFn: (count: number) => void,eventName: string) {
        if(freeCount <= 0) {
            if (!GlobalConfig.isDebug) {
                AdvertMgr.instance.showReawardVideo(() => {
                    EventDispatcher.instance.emit(eventName);
                });
            } else {
                EventDispatcher.instance.emit(eventName);
            }
        } else {
            reduceFn(1);
            EventDispatcher.instance.emit(eventName);
        }
    }

    private unregisterListener() {
        EventDispatcher.instance.off(GameEvent.EVENT_REFRESH_PLAYER_INFO,this.updateBtnsCountUI,this); 
    }
}