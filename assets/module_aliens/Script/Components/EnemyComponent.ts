import { _decorator, CCBoolean, CCFloat, Collider, Component, isValid, ITriggerEvent, Node, PhysicsSystem, tween, Tween, Vec3 } from 'cc';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';

const { ccclass, property } = _decorator;

export enum EnemyStatus {
    LIFE,
    DIE
}

@ccclass('EnemyComponent')
export class EnemyComponent extends Component {
    currentHp: number = 0;
    status: EnemyStatus = EnemyStatus.LIFE;
    speed: number = 50;
    headshot:boolean = false;
    tigger: Collider = null!;

    protected onLoad(): void {
        this.tigger = this.node.getComponent(Collider)!;
    }

    start() {
        this.status = EnemyStatus.LIFE;
        this.tigger = this.node.getComponent(Collider)!;
        this.registerEvent();
    }

    private registerEvent() {
        this.tigger.on('onTriggerEnter', this.onTriggerEnter, this);
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_SHOOT_ENEMY, this.onShootEnemy, this);
    }

    private unRegisterEvent() {
        this.tigger.off('onTriggerEnter', this.onTriggerEnter, this);
    }

    protected onTriggerEnter(event: ITriggerEvent): void {
    }

    private onShootEnemy(hitNode: Node){
        // 检查是否是当前怪物节点被击中
        if(this.node === hitNode && this.status === EnemyStatus.LIFE) {
            this.status = EnemyStatus.DIE;
            
            // 播放死亡动画或效果
            tween(this.node)
                .to(0.3, { scale: new Vec3(0, 0, 0) })
                .call(() => {
                    // 销毁怪物节点
                    this.node.destroy();
                })
                .start();
        }
    }

    protected onDestroy(): void {
        Tween.stopAllByTarget(this.node);
        this.unRegisterEvent();
    }
}


