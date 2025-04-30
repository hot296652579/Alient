import { _decorator, CCBoolean, CCFloat, Collider, Component, isValid, ITriggerEvent, Node, PhysicsSystem, Quat, RigidBody, tween, Tween, Vec3 } from 'cc';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';

const { ccclass, property } = _decorator;

export enum EnemyStatus {
    LIFE,
    DIE
}

@ccclass('EnemyComponent')
export class EnemyComponent extends Component {

    @property(RigidBody)
    rigidBody: RigidBody = null!;

    @property(Node)
    head: Node = null!;

    @property(Node)
    leftHandGuge: Node = null!;

    @property(Node)
    rightHandGuge: Node = null!;

    @property(Node)
    leftFootGuge: Node = null!;

    @property(Node)
    rightFootGuge: Node = null!;

    currentHp: number = 0;
    status: EnemyStatus = EnemyStatus.LIFE;
    speed: number = 50;
    headshot: boolean = false;
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

    private onShootEnemy(hitNode: Node) {
        // 检查是否是当前怪物节点被击中
        if (this.node === hitNode && this.status === EnemyStatus.LIFE) {
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

    // 中枪抽搐效果
    playHitTwitch() {
        // 抖动参数配置
        const shakeConfig = {
            head: { times: 5, duration: 0.12, axis: 'x' },
            leftHand: { times: 6, duration: 0.1, axis: 'y' },
            rightHand: { times: 6, duration: 0.15, axis: 'y' },
            leftFoot: { times: 4, duration: 0.1, axis: 'y' },
            rightFoot: { times: 4, duration: 0.1, axis: 'y' }
        };

        // 生成随机抖动值
        const getRandomShake = () => (10 + Math.random() * 10) * (Math.random() > 0.5 ? 1 : -1);

        // 创建抖动动画函数
        const createShakeTween = (node: Node, config: { times: number, duration: number, axis: string }) => {
            const rotation = node.rotation.clone();
            const t = tween(node);

            for (let i = 0; i < config.times; i++) {
                const shakeValue = getRandomShake();
                let newRotation = rotation.clone();

                if (config.axis === 'x') {
                    newRotation = Quat.fromEuler(new Quat(), -90 + getRandomShake(), rotation.y, rotation.z);
                } else {
                    newRotation = Quat.fromEuler(new Quat(), 90, rotation.y + shakeValue, rotation.z);
                }

                t.to(config.duration, { rotation: newRotation });
            }

            return t;
        };

        // 头部抖动
        createShakeTween(this.head, shakeConfig.head).start();

        // 左手抖动
        createShakeTween(this.leftHandGuge, shakeConfig.leftHand).start();

        // 右手抖动
        createShakeTween(this.rightHandGuge, shakeConfig.rightHand).start();

        // 左腿抖动
        createShakeTween(this.leftFootGuge, shakeConfig.leftFoot).start();

        // 右腿抖动
        createShakeTween(this.rightFootGuge, shakeConfig.rightFoot).start();
    }

    protected onDestroy(): void {
        Tween.stopAllByTarget(this.node);
        this.unRegisterEvent();
    }
}


