import { _decorator, Component, Node } from 'cc';
import { GameUILayers } from "../../../../scripts/GameUILayers";
import { UI_PowerUp } from "../../../../scripts/UIDef";
import { tgxModuleContext } from 'db://assets/core_tgx/tgx';
import { Layout_PowerUp } from './Layout_PowerUp';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GlobalConfig } from 'db://assets/start/Config/GlobalConfig';
import { AdvertMgr } from 'db://assets/core_tgx/base/ad/AdvertMgr';
import { UserManager } from '../../../Script/Manager/UserMgr';
import { GameEvent } from '../../../Script/Enum/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('UI_PowerUp_Impl')
export class UI_PowerUp_Impl extends UI_PowerUp {

    constructor() {
        super('Prefabs/UI/PowerUp/UI_PowerUp', GameUILayers.POPUP, Layout_PowerUp);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_PowerUp;
        this.onButtonEvent(layout.btn_get, () => {
            if (!GlobalConfig.isDebug) {
                AdvertMgr.instance.showReawardVideo(() => {

                })
            } else {
                this.hide();
                UserManager.instance.addPower(1);
                EventDispatcher.instance.emit(GameEvent.EVENT_GAME_ENTER);
            }
        });
        this.onButtonEvent(layout.btn_back, () => {
            this.hide();
        });
    }
}

tgxModuleContext.attachImplClass(UI_PowerUp, UI_PowerUp_Impl);


