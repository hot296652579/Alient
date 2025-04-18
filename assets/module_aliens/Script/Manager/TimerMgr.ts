import { assetManager, instantiate, Prefab, Node, UITransform, Vec3, Vec2, view, game, director, Scheduler, Label } from "cc";

import { GameUtil } from "../GameUtil";
import { AliensGlobalInstance } from "../AliensGlobalInstance";
import { tgxUIMgr } from "db://assets/core_tgx/tgx";
import { UI_TimeExpan,UI_BattleResult } from "db://assets/scripts/UIDef";
import { UserManager } from "./UserMgr";
import { LevelManager } from "./LevelMgr";

/** 时间管理器*/
export class TimerMgr {
    private static _instance: TimerMgr;
    public static get Instance(): TimerMgr {
        if (this._instance == null) {
            this._instance = new TimerMgr();
        }
        return this._instance;
    }

    public static get inst(): TimerMgr {
        return this.Instance;
    }

    private _countDownTime: number = 1;
    public get countDownTime(): number {
        return this._countDownTime;
    }
    public set countDownTime(value: number) {
        this._countDownTime = value;
    }

    private timerId: number = 0;
    private isPaused: boolean = false;  // 添加暂停标志
    //加时次数
    private addTimeCount: number = 0;

    constructor() {
    }

    // 开始倒计时
    public startCountdown(): void {
        if (this.isPaused) {
            this.resumeCountdown();
            return;
        }
        this.upateLbTime();
        this.timerId = setInterval(() => {
            if (!this.isPaused) {
                this.countDownTime--;
                if (this.countDownTime <= 0) {
                    this.stopCountdown();

                    if(this.addTimeCount < 1){
                        this.showCountdownPopup();
                    }else{
                        this.showResultPopup();
                    }
                    this.addTimeCount++;
                }
                this.upateLbTime();
            }
        }, 1000); // 每秒减少一次

        Scheduler.enableForTarget(this);
        director.getScheduler().schedule(this.update, this, 0);
    }

    private upateLbTime() {
        const battleUI = AliensGlobalInstance.instance.battleUI;
        const lbTime = battleUI.getChildByPath('Times/LbTime')!;
        // lbTime.getComponent(Label).string = this.countDownTime.toString();
        const format = GameUtil.formatToTimeString(this.countDownTime);
        lbTime.getComponent(Label).string = format;
    }

    // 停止倒计时
    private stopCountdown(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = 0;
        }
    }

    // 暂停倒计时
    public pauseCountdown(): void {
        this.isPaused = true;
        director.getScheduler().pauseTarget(this);
    }

    // 恢复倒计时
    public resumeCountdown(): void {
        this.isPaused = false;
        director.getScheduler().resumeTarget(this);
    }

    // 获取暂停状态
    public isPausedState(): boolean {
        return this.isPaused;
    }

    // update方法，每帧调用
    public update(dt: number): void {

    }

    //倒计时弹窗
    private showCountdownPopup(): void {
        const revive = tgxUIMgr.inst.isShowing(UI_TimeExpan);
        if (!revive) {
            tgxUIMgr.inst.showUI(UI_TimeExpan);
        }
    }

    //结算弹窗
    private showResultPopup(): void {
        const revive = tgxUIMgr.inst.isShowing(UI_BattleResult);
        if (!revive) {
            tgxUIMgr.inst.showUI(UI_BattleResult);
        }
    }

    // 销毁时清理
    public reset(): void {
        this.stopCountdown();
        this.isPaused = false;  // 重置暂停状态
        Scheduler.enableForTarget(this);
        director.getScheduler().unscheduleAllForTarget(this);
        this.addTimeCount = 0;
        this.countDownTime = LevelManager.instance.levelModel.levelTime;
        this.countDownTime = 20; //测试
    }
}