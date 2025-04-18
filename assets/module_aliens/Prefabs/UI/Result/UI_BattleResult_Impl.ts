import { isValid, Label, tween, v3, Vec3, Node, Tween } from "cc";
import { tgxModuleContext } from "../../../../core_tgx/tgx";
import { GameUILayers } from "../../../../scripts/GameUILayers";
import { UI_BattleResult } from "../../../../scripts/UIDef";
import { Layout_BattleResult } from "./Layout_BattleResult";
import { GameEvent } from "../../../Script/Enum/GameEvent";
import { LevelManager } from "../../../Script/Manager/LevelMgr";
import { AliensAudioMgr } from "../../../Script/Manager/CarUnscrewAudioMgr";
import { UserManager } from "../../../Script/Manager/UserMgr";
import { TimerMgr } from "../../../Script/Manager/TimerMgr";
import { EventDispatcher } from "db://assets/core_tgx/easy_ui_framework/EventDispatcher";

export class UI_BattleResult_Impl extends UI_BattleResult {
    rewardBase: number = 0; //基础奖励
    rewardAdditional: number = 0; //额外奖励
    timeoutIds: Array<number> = [];
    win: boolean = true;

    constructor() {
        super('Prefabs/UI/Result/UI_BattleResult', GameUILayers.POPUP, Layout_BattleResult);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        this.win = LevelManager.instance.levelModel.isWin;
        const soundId = this.win ? 7 : 8;
        AliensAudioMgr.playOneShot(AliensAudioMgr.getMusicIdName(soundId), 1.0);

        let layout = this.layout as Layout_BattleResult;
        this.onButtonEvent(layout.btNext, () => {
            this.onClickRewardBase();
        });
        this.onButtonEvent(layout.btRestart, () => {
            this.onClickRewardBase();
        });

        layout.winNode.active = this.win;
        layout.loseNode.active = !this.win;
    }

    private emitEvent(): void {
        TimerMgr.inst.reset();
        UserManager.instance.reset();

        if (this.win) {
            LevelManager.instance.levelUpHandler();
        } else {
            LevelManager.instance.restartLevelHandler();
        }
    }

    onClickRewardBase(): void {
        this.destoryMyself();
        this.emitEvent();
    }

    clearAllTimeouts() {
        this.timeoutIds.forEach((id) => clearTimeout(id));
        this.timeoutIds = [];
    }

    private destoryMyself(): void {
        Tween.stopAllByTarget(this.node)
        if (isValid(this.node)) {
            this.node.removeFromParent();
            this.hide();
        }
        this.clearAllTimeouts();
    }
}

tgxModuleContext.attachImplClass(UI_BattleResult, UI_BattleResult_Impl);