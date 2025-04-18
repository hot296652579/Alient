import { _decorator, Component, Label, Node } from 'cc';
import { UserManager } from './Manager/UserMgr';
import { GameUtil } from './GameUtil';
import { tgxUIMgr } from '../../core_tgx/tgx';
import { UI_BattleGambit } from '../../scripts/UIDef';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('HomeUI')
export class HomeUI extends Component {

    @property(Label)
    public lbPower: Label = null; 

    @property(Label)
    public lbTimeCount: Label = null; // 倒计时组件

    //体力恢复时间
    private powerRecoverTime: number = 1;
    //体力最大值
    private powerMax: number = 1;
    //当前体力
    private powerCurrent: number = 0;
    //剩余恢复时间
    private remainingTime: number = 0;

    protected onLoad(): void {
        this.registerListener();
    }

    protected onDestroy(): void {
        this.unregisterListener();
    }

    start() {
        const {powerRecoverTime,powerMax,powerCurrent} = UserManager.instance.userModel;
        this.powerRecoverTime = powerRecoverTime;
        this.powerMax = powerMax;
        this.powerCurrent = powerCurrent;

        const lastLeave = localStorage.getItem("lastLeaveTime");
        if (lastLeave) {
            const lastTime = parseInt(lastLeave);
            const now = Date.now();
            const offlineSeconds = Math.floor((now - lastTime) / 1000);
            
            // 计算可以恢复的体力数量
            const recoverCount = Math.floor(offlineSeconds / this.powerRecoverTime);
            this.powerCurrent = Math.min(this.powerCurrent + recoverCount, this.powerMax);
            
            // 计算剩余恢复时间
            if (this.powerCurrent < this.powerMax) {
                this.remainingTime = this.powerRecoverTime - (offlineSeconds % this.powerRecoverTime);
            } else {
                this.remainingTime = 0;
            }
            
            console.log(`离线恢复: ${recoverCount}点体力, 当前体力: ${this.powerCurrent}/${this.powerMax}`);
        } else {
            this.remainingTime = this.powerRecoverTime;
        }

        // 保存当前时间为新的退出时间
        localStorage.setItem("lastLeaveTime", Date.now().toString());
        this.updatePowerUI();
    }

    private registerListener() {
        EventDispatcher.instance.on(GameEvent.EVENT_REFRESH_PLAYER_INFO,this.updatePowerUI,this);
    }

    update(deltaTime: number) {
        if(!this.lbTimeCount || !this.lbPower) return;
        if (this.powerCurrent >= this.powerMax) {
            this.lbTimeCount.string = 'Max';
            return;
        }

        this.remainingTime -= deltaTime;
        if (this.remainingTime <= 0) {
            this.powerCurrent = Math.min(this.powerCurrent + 1, this.powerMax);
            this.remainingTime = this.powerRecoverTime;
            this.updatePowerUI();
        }

        this.lbTimeCount.string = GameUtil.formatToTimeString(Math.ceil(this.remainingTime));
    }

    private updatePowerUI() {
        if(!this.lbPower) return;
        this.lbPower.string = this.powerCurrent.toString();
        if (this.powerCurrent >= this.powerMax) {
            this.lbTimeCount.string = 'Max';
        }
    }

    private unregisterListener() {
        EventDispatcher.instance.off(GameEvent.EVENT_REFRESH_PLAYER_INFO,this.updatePowerUI,this); 
    }
}