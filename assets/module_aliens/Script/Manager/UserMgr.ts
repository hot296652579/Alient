import { Node, Prefab, _decorator, assetManager, find, instantiate, sys } from 'cc';
import { UserModel } from '../Model/UserModel';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('UserManager')
export class UserManager {
    private static _instance: UserManager | null = null;
    public static get instance(): UserManager {
        if (!this._instance) this._instance = new UserManager();
        return this._instance;
    }

    public userModel: UserModel = null;

    initilizeModel(): void {
        this.userModel = new UserModel();
        this.userModel.initialize();
    }

    /**
     * 增加体力
     * @param value 增加的数量
     * @returns 增加后的体力值
     */
    public addPower(value: number): number {
        this.userModel.powerCurrent = Math.min(this.userModel.powerCurrent + value, this.userModel.powerMax);
        EventDispatcher.instance.emit(GameEvent.EVENT_REFRESH_PLAYER_INFO);
        return this.userModel.powerCurrent;
    }

    /**
     * 减少体力
     * @param value 减少的数量
     * @returns 是否成功减少
     */
    public reducePower(value: number): boolean {
        if (this.userModel.powerCurrent >= value) {
            this.userModel.powerCurrent -= value;
            EventDispatcher.instance.emit(GameEvent.EVENT_REFRESH_PLAYER_INFO); 
            return true;
        }
        return false;
    }

    /**
     * 增加雷达免费次数
     * @param value 增加的数量
     * @returns 增加后的次数
     */
    public addRadarFreeCount(value: number): number {
        this.userModel.radarFreeCount += value;
        EventDispatcher.instance.emit(GameEvent.EVENT_REFRESH_PLAYER_INFO); 
        return this.userModel.radarFreeCount;
    }

    /**
     * 减少雷达免费次数
     * @param value 减少的数量
     * @returns 是否成功减少
     */
    public reduceRadarFreeCount(value: number): boolean {
        if (this.userModel.radarFreeCount >= value) {
            this.userModel.radarFreeCount -= value;
            EventDispatcher.instance.emit(GameEvent.EVENT_REFRESH_PLAYER_INFO); 
            return true;
        }
        return false;
    }

    /**
     * 增加侦探免费次数
     * @param value 增加的数量
     * @returns 增加后的次数
     */
    public addFreeScreenShotCount(value: number): number {
        this.userModel.freeScreenShotCount += value;
        EventDispatcher.instance.emit(GameEvent.EVENT_REFRESH_PLAYER_INFO); 
        return this.userModel.freeScreenShotCount;
    }

    /**
     * 减少侦探免费次数
     * @param value 减少的数量
     * @returns 是否成功减少
     */
    public reduceFreeScreenShotCount(value: number): boolean {
        if (this.userModel.freeScreenShotCount >= value) {
            this.userModel.freeScreenShotCount -= value;
            EventDispatcher.instance.emit(GameEvent.EVENT_REFRESH_PLAYER_INFO); 
            return true;
        }
        return false;
    }

    reset(): void {
       this.userModel.freeScreenShotCount = 0;
       this.userModel.radarFreeCount = 0; 
    }

}
