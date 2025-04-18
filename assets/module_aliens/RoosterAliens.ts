import { _decorator, Component, ERaycast2DType, find, Label, Node, NodeEventType, PhysicsSystem2D, Tween, tween, v2, v3, Vec2, Vec3 } from 'cc';
import { GameEvent } from './Script/Enum/GameEvent';
import { LevelManager } from './Script/Manager/LevelMgr';
import { GameUtil } from './Script/GameUtil';
import { LevelAction } from './Script/LevelAction';
import { GlobalConfig } from '../start/Config/GlobalConfig';
import { AdvertMgr } from '../core_tgx/base/ad/AdvertMgr';
import { AliensAudioMgr } from './Script/Manager/CarUnscrewAudioMgr';
import { AliensGlobalInstance } from './Script/AliensGlobalInstance';
import { UI_PowerUp, UI_Setting } from '../scripts/UIDef';
import { tgxUIMgr } from '../core_tgx/tgx';
import { EventDispatcher } from '../core_tgx/easy_ui_framework/EventDispatcher';
import { UserManager } from './Script/Manager/UserMgr';
import { TimerMgr } from './Script/Manager/TimerMgr';
const { ccclass, property } = _decorator;

const duration = 0.3;
@ccclass('RoosterAliens')
export class RoosterAliens extends Component {

    onLoad() {
        AliensAudioMgr.initilize();
        // AliensAudioMgr.play(AliensAudioMgr.getMusicIdName(2), 1.0);
        UserManager.instance.initilizeModel();
        LevelManager.instance.initilizeModel();
        AliensGlobalInstance.instance.initUI(); //初始化u
        this.registerListener();
        this.resetMgr(); 
    }

    private resetMgr() {
        UserManager.instance.reset();
        TimerMgr.inst.reset();
    }

    protected start(): void {
        AliensGlobalInstance.instance.homeUI.active = true;
        AliensGlobalInstance.instance.battleUI.active = false;
    }

    async startGame() {
        await LevelManager.instance.gameStart();
    }

    registerListener() {
        //UI监听
        const btnRefresh = find('Canvas/GameUI/TopLeft/BtnRefresh')!;
        const btnSet = find('Canvas/GameUI/TopLeft/BtnSet')!;
        const btnPoint = find('Canvas/GameUI/BattleUI/Aim/BtPoint')!;
        const btnPointFrame = find('Canvas/GameUI/BattleUI/AimTarget/Mask/frame')!;
        const btnShoot = find('Canvas/GameUI/BattleUI/AimTarget/BtnShoot')!;
        const btnStart = find('Canvas/GameUI/HomeUI/BtnStart')!;

        btnSet.on(NodeEventType.TOUCH_END, () => this.onClickSet(), this);
        btnPoint.on(NodeEventType.TOUCH_END, () => this.onClickAim(), this);
        btnPointFrame.on(NodeEventType.TOUCH_END, () => this.onClickResetAim(), this);
        btnShoot.on(NodeEventType.TOUCH_END, () => this.onShoot(), this);
        btnStart.on(NodeEventType.TOUCH_END, () => this.onStart(), this);

        //TEST
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_SHOOT_TEXT,this.testShoot,this);
        EventDispatcher.instance.on(GameEvent.EVENT_GAME_ENTER,this.onStart,this);
    }

    private onClickSet(): void {
        AliensAudioMgr.playOneShot(AliensAudioMgr.getMusicIdName(2), 1.0);
        const show = tgxUIMgr.inst.isShowing(UI_Setting);
        if (!show) {
            tgxUIMgr.inst.showUI(UI_Setting);
        }
    }

    private onClickAim(): void {
        const aimTarget = AliensGlobalInstance.instance.aimTarget;
        aimTarget.active = true;
        EventDispatcher.instance.emit(GameEvent.EVENT_CAMERA_AIM);
    }

    private onClickResetAim(): void {
        const aimTarget = AliensGlobalInstance.instance.aimTarget;
        aimTarget.active = false;
        EventDispatcher.instance.emit(GameEvent.EVENT_CAMERA_RESET_AIM);
    }

    private onShoot(): void {
        EventDispatcher.instance.emit(GameEvent.EVENT_CAMERA_SHOOT);
        this.onClickResetAim();
    }

    private async onStart(): Promise<void> {
        const power = UserManager.instance.reducePower(1);
        if (!power) {
            const match = tgxUIMgr.inst.isShowing(UI_PowerUp);
            if (!match) {
                tgxUIMgr.inst.showUI(UI_PowerUp);
            }
            return;
        }
        await this.startGame();
        AliensGlobalInstance.instance.homeUI.active = false;
        AliensGlobalInstance.instance.battleUI.active = true;
        UserManager.instance.reducePower(1);
    }

    private testShoot(): void {
        const lbTestShoot = AliensGlobalInstance.instance.lbTestShoot;
        lbTestShoot.string = '击中了';

        this.scheduleOnce(() => {
            lbTestShoot.string = '';
        }, 1.0);
    }
}




