import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
import { LevelManager } from '../Manager/LevelMgr';
import { UI_BattleResult } from 'db://assets/scripts/UIDef';
import { tgxUIMgr } from 'db://assets/core_tgx/tgx';
const { ccclass, property } = _decorator;

@ccclass('RemainComponent')
export class RemainComponent extends Component {

    @property(Prefab)
    public remainPrefab: Prefab = null;
    private remainCount: number = 0; // 剩余数量

    protected onLoad(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_INIT_REMAIN_ENEMY, this.initializeRemainCount, this); 
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_SHOOT_ENEMY, this.reduceCount, this); 
    }

    start() {
    }

    private initializeRemainCount(count:number): void {
         this.remainCount = count;
         this.initRemainCount(this.remainCount);
    }

    private initRemainCount(remainCount: number): void {
        this.remainCount = remainCount;
        this.updateRemainCount();
    }

    private updateRemainCount(): void {
        // 先清空所有子节点
        this.node.removeAllChildren();
        
        // 根据剩余数量实例化预设
        for (let i = 0; i < this.remainCount; i++) {
            const item = instantiate(this.remainPrefab);
            this.node.addChild(item);
        }
    }

    public reduceCount(): boolean {
        if (this.remainCount <= 0) {
            return false;
        }

        // 获取最后一个实例化的节点
        const lastChild = this.node.children[this.remainCount - 1];
        if (lastChild) {
            const deathNode = lastChild.getChildByName('Death');
            const activeNode = lastChild.getChildByName('Active');
            
            if (deathNode && activeNode) {
                deathNode.active = true;
                activeNode.active = false;
            }
        }

        this.remainCount--;

        if(this.remainCount <= 0){
            LevelManager.instance.levelModel.isWin = true;
            const revive = tgxUIMgr.inst.isShowing(UI_BattleResult);
            if (!revive) {
                tgxUIMgr.inst.showUI(UI_BattleResult);
            }
        }
        return true;
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_INIT_REMAIN_ENEMY, this.initializeRemainCount, this); 
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_SHOOT_ENEMY, this.reduceCount, this); 
    }
}


