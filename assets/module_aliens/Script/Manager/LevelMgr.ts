import { Node, Prefab, _decorator, assetManager, find, instantiate, sys } from 'cc';
import { resLoader } from 'db://assets/core_tgx/base/ResLoader';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GlobalConfig } from '../../../start/Config/GlobalConfig';
import { GameEvent } from '../Enum/GameEvent';
import { LevelAction } from '../LevelAction';
import { LevelModel } from '../Model/LevelModel';
import { GameUtil } from '../GameUtil';
import { AliensGlobalInstance } from '../AliensGlobalInstance';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager {
    private static _instance: LevelManager | null = null;
    public static get instance(): LevelManager {
        if (!this._instance) this._instance = new LevelManager();
        return this._instance;
    }

    public levelModel: LevelModel = null;
    currentLevel: Node = null!;
    randomLevel: number = 0;

    initilizeModel(): void {
        this.levelModel = new LevelModel();

        this.preloadLevel();
        this.registerEvent();
    }

    private registerEvent(): void {
        // EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP, this.levelUpHandler, this);
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET, this.restartLevelHandler, this);
    }

    async loadAsyncLevel(level: number): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(resLoader.gameBundleName);
            if (!bundle) {
                console.error("module_nut is null!");
                reject();
            }

            console.log('加载的level:', level);
            resLoader.loadAsync(resLoader.gameBundleName, `Prefabs/Levels/level_${level}`, Prefab).then((prefab: Prefab) => {
                resolve(prefab);
            })
        })
    }

    /** 预加载关卡*/
    async preloadLevel() {
        const bundle = assetManager.getBundle(resLoader.gameBundleName);
        for (let i = 1; i <= GlobalConfig.levelTotal; i++) {
            bundle.preload(`Prefabs/Levels/level_${i}`, Prefab, null, () => {
                // console.log(`Level:${i} 预加载完成!`);
            })
        }
    }

    async levelUpHandler() {
        this.clearLevelData();
        this.upgradeLevel();
        await this.gameStart();
    }

    async restartLevelHandler() {
        this.clearLevelData();
        await this.gameStart();
    }

    public async gameStart() {
        if (!this.levelModel) return;
        const { level } = this.levelModel;
        await this.loadLevel(level);
    }

    /** 清除关卡数据*/
    clearLevelData(): void {
        this.levelModel.clearLevel();
    }

    upgradeLevel(up: number = 1): void {
        this.levelModel.level += up;
        sys.localStorage.setItem('alient_level', this.levelModel.level.toString());
        if (this.levelModel.level > GlobalConfig.levelTotal) {
            const randomLevelList = this.levelModel.randomLevelList;

            // 随机选择一个值
            let randomIndex = Math.floor(Math.random() * randomLevelList.length);
            let randomLevel = randomLevelList[randomIndex];

            // 如果随机到的关卡和当前关卡相同，则重新随机
            while (randomLevel === this.randomLevel && randomLevelList.length > 1) {
                randomIndex = Math.floor(Math.random() * randomLevelList.length);
                randomLevel = randomLevelList[randomIndex];
            }

            this.randomLevel = randomLevel;
            console.log(`随机真实关卡level: ${this.randomLevel}`);
            this.levelModel.setLevelConfig(this.randomLevel);
        }
        else {
            this.levelModel.levelConfig.init(this.levelModel.level);
        }
        EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP);
    }

    async loadLevel(level: number): Promise<Node> {
        let levelPrefab = null;
        if (this.levelModel.level > GlobalConfig.levelTotal) {
            console.log('随机关卡加载 this.randomLevel: ' + this.randomLevel);
            levelPrefab = await this.loadAsyncLevel(this.randomLevel);
        } else {
            levelPrefab = await this.loadAsyncLevel(level);
        }

        if (this.currentLevel) {
            this.currentLevel.destroy();
        }

        if (!levelPrefab) {
            console.log(`关卡预设不存在 level: ${level}.`)
            return;
        }

        const levels = AliensGlobalInstance.instance.levels;
        this.currentLevel = instantiate(levelPrefab);
        levels.removeAllChildren();
        levels.addChild(this.currentLevel);
        return this.currentLevel;
    }
}
