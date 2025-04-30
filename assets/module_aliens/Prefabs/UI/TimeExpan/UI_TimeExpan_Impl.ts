import { _decorator, Component, Node } from 'cc';
import { GameUILayers } from "../../../../scripts/GameUILayers";
import { UI_BattleResult, UI_TimeExpan } from "../../../../scripts/UIDef";
import { tgxModuleContext, tgxUIMgr } from 'db://assets/core_tgx/tgx';
import { Layout_TimeExpan } from './Layout_TimeExpan';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GlobalConfig } from 'db://assets/start/Config/GlobalConfig';
import { AdvertMgr } from 'db://assets/core_tgx/base/ad/AdvertMgr';
import { TimerMgr } from '../../../Script/Manager/TimerMgr';
import { LevelManager } from '../../../Script/Manager/LevelMgr';
import { UserManager } from '../../../Script/Manager/UserMgr';
const { ccclass, property } = _decorator;

@ccclass('UI_TimeExpan_Impl')
export class UI_TimeExpan_Impl extends UI_TimeExpan {
    
    private _addTime: number = 1;

    constructor() {
        super('Prefabs/UI/TimeExpan/UI_TimeExpan', GameUILayers.POPUP, Layout_TimeExpan);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        this._addTime = UserManager.instance.userModel.reviveAddTime;
        this._addTime = 15;//测试

        let layout = this.layout as Layout_TimeExpan;
        this.onButtonEvent(layout.btn_get, () => {
            if (!GlobalConfig.isDebug) {
                AdvertMgr.instance.showReawardVideo(() => {
                    this.addTime();
                })
            } else {
                this.addTime();
            }
        });
        this.onButtonEvent(layout.btn_back, () => {
            this.hide();

            LevelManager.instance.levelModel.isWin = false;
            const revive = tgxUIMgr.inst.isShowing(UI_BattleResult);
            if (!revive) {
                tgxUIMgr.inst.showUI(UI_BattleResult);
            }
        });
    }

    //加时
    private addTime() {
        TimerMgr.inst.countDownTime = this._addTime;
        TimerMgr.inst.startCountdown();
        this.hide();
    }
}

tgxModuleContext.attachImplClass(UI_TimeExpan, UI_TimeExpan_Impl);


