import { _decorator, Component, Node } from 'cc';
import { GameUILayers } from "../../../../scripts/GameUILayers";
import { UI_BattleGambit } from "../../../../scripts/UIDef";
import { tgxModuleContext } from 'db://assets/core_tgx/tgx';
import { Layout_BattleGambit } from './Layout_BattleGambit';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GlobalConfig } from 'db://assets/start/Config/GlobalConfig';
import { AdvertMgr } from 'db://assets/core_tgx/base/ad/AdvertMgr';
import { UserManager } from '../../../Script/Manager/UserMgr';
import { GameEvent } from '../../../Script/Enum/GameEvent';
import { TimerMgr } from '../../../Script/Manager/TimerMgr';
const { ccclass, property } = _decorator;

@ccclass('UI_BattleGambit_Impl')
export class UI_BattleGambit_Impl extends UI_BattleGambit {

    constructor() {
        super('Prefabs/UI/Gambit/UI_BattleGambit', GameUILayers.POPUP, Layout_BattleGambit);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_BattleGambit;
        this.onButtonEvent(layout.btn_get, () => {
            if (!GlobalConfig.isDebug) {
                AdvertMgr.instance.showReawardVideo(() => {
                    this.addFreeCount(); 
                    this.startCountdown();
                })
            } else {
                this.addFreeCount(); 
                this.startCountdown();
            }
        });
        this.onButtonEvent(layout.btn_back, () => {
            this.startCountdown();
        });
    }

    private startCountdown() {
        this.hide();
        TimerMgr.inst.startCountdown(); 
    }

    //增加情报和侦探免费次数
    private addFreeCount() {
        UserManager.instance.addFreeScreenShotCount(1);
        UserManager.instance.addRadarFreeCount(1);
        EventDispatcher.instance.emit(GameEvent.EVENT_REFRESH_PLAYER_INFO); //刷新ui
    }
}

tgxModuleContext.attachImplClass(UI_BattleGambit, UI_BattleGambit_Impl);


