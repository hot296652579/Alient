import { _decorator, BoxCollider2D, Button, Camera, CCFloat, CircleCollider2D, Color, Component, debug, DebugView, director, EventTouch, find, geometry, Input, input, math, Node, NodeEventType, PhysicsSystem, Quat, RenderTexture, Tween, tween, v3, Vec3, view } from 'cc';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { LineDrawer } from './LineDrawer';
import { EnemyComponent } from './Components/EnemyComponent';
import { AliensGlobalInstance } from './AliensGlobalInstance';
import { ScreenShotComponent } from './Components/ScreenShotComponent';
import { GameUtil } from './GameUtil';
import { RadarComponent } from './Components/RadarComponent';
import { tgxUIMgr } from '../../core_tgx/tgx';
import { UI_BattleGambit } from '../../scripts/UIDef';
import { CameraSegmentation, moveDuration } from './CamerSegmentation';
import { TimerMgr } from './Manager/TimerMgr';
import { LevelManager } from './Manager/LevelMgr';

const { ccclass, property } = _decorator;
//动画时长
export const ANIMATION_DURATION = 0.5;

@ccclass('LevelAction')
export class LevelAction extends Component {

    @property(Camera)
    public camera: Camera = null!;

    private _renderTex: RenderTexture | null = null;
    private _isZooming = false;
    public targetNode: Node = null!;

    //关卡怪物总数
    @property({ type: CCFloat, displayName: "怪物总数" })
    public enemyTotal: number = 0;

    @property({ type: CCFloat, displayName: "拉近镜头的距离" })
    zoomDistance: number = 10; //拉近镜头的距离

    @property({ type: CCFloat, displayName: "旋转速度" })
    rotateSpeed: number = 0.2;

    // 添加旋转限制属性
    @property({ type: CCFloat, displayName: "水平旋转限制角度" })
    horizontalLimit: number = 50; // 水平旋转限制角度(左右各50度)
    @property({ type: CCFloat, displayName: "垂直旋转限制角度" })
    @property
    verticalLimit: number = 30; // 垂直旋转限制角度(上下各30度)

    private _initialRotation: Vec3 = new Vec3(0, 0, 0); // 初始旋转角度
    private _initialPosition: Vec3 = new Vec3();
    private _isZoomed: boolean = false; // 记录是否处于拉近状态

    onLoad(): void {
        this.camera.node.rotation.getEulerAngles(this._initialRotation);
        this._initialPosition = this.camera.node.position.clone();
        this.registerEvent();
    }

    start() {
        this.initilizeUI();
        this.saveCameraState();

        EventDispatcher.instance.emit(GameEvent.EVENT_INIT_REMAIN_ENEMY, this.enemyTotal);
    }

    private initilizeUI() {
        const renderNode = AliensGlobalInstance.instance.renderNode;
        const aimTarget = AliensGlobalInstance.instance.aimTarget;
        const radarNode = AliensGlobalInstance.instance.radarNode;
        renderNode.active = false;
        aimTarget.active = false;
        radarNode.active = false;

        const match = tgxUIMgr.inst.isShowing(UI_BattleGambit);
        if (!match) {
            tgxUIMgr.inst.showUI(UI_BattleGambit);
        }
    }

    private registerEvent() {
        // 触摸事件监听
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);

        //事件监听
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_AIM, this.onAimTarget, this);
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_RESET_AIM, this.onResetAimTarget, this);
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_SHOOT, this.onShoot, this);
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_SCREENSHOT_RADAR_LOCK, this.onCameraToTarget, this);
    }

    private unRegisterEvent() {
        // 触摸事件监听
        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);

        //事件监听
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_AIM, this.onAimTarget, this);
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_RESET_AIM, this.onResetAimTarget, this);
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_SHOOT, this.onShoot, this);
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_SCREENSHOT_RADAR_LOCK, this.onCameraToTarget, this);
    }

    private onAimTarget() {
        if (this._isZoomed) return;

        // 获取相机前方方向(世界坐标)
        const forward = new Vec3(0, 0, -1);
        Vec3.transformQuat(forward, forward, this.camera.node.rotation);
        // 朝前方移动(拉近)
        Vec3.scaleAndAdd(this.camera.node.position, this._initialPosition, forward, this.zoomDistance);
        this.camera.node.setPosition(this.camera.node.position);
        this._isZoomed = true;
    }

    private onResetAimTarget() {
        if (!this._isZoomed) return;

        // 恢复到初始位置但保持当前旋转角度
        const currentRotation = new Vec3();
        this.camera.node.rotation.getEulerAngles(currentRotation);
        this.camera.node.setPosition(this._initialPosition);

        // 保持旋转角度不变
        const rotation = new Quat();
        Quat.fromEuler(rotation, currentRotation.x, currentRotation.y, 0);
        this.camera.node.setRotation(rotation);
        this._isZoomed = false;
    }

    private async onShoot() {
        // 获取正确的屏幕中心坐标
        const screenCenter = view.getVisibleSize();
        const screenX = screenCenter.width * 0.5 * view.getScaleX();
        const screenY = screenCenter.height * 0.5 * view.getScaleY();

        // 从屏幕中心发射射线
        const ray = new geometry.Ray();
        this.camera.screenPointToRay(screenX, screenY, ray);

        // 射线检测参数
        const mask = 0xffffffff;
        const maxDistance = 1000;
        const queryTrigger = true;

        // 执行射线检测
        const hasHit = PhysicsSystem.instance.raycast(ray, mask, maxDistance, queryTrigger);

        if (hasHit) {
            const results = PhysicsSystem.instance.raycastResults;
            for (let i = 0; i < results.length; i++) {
                const item = results[i];
                const hitNode = item.collider.node;

                if(item.collider.getGroup() == 1 << 4) {
                    LevelManager.instance.levelModel.headshotCount++;
                }

                if (hitNode.getComponent(EnemyComponent)) {
                    LevelManager.instance.levelModel.hitCount++;
                    // console.log(`击中次数: ${LevelManager.instance.levelModel.hitCount} 爆头次数: ${LevelManager.instance.levelModel.headshotCount}`)
                    const levelNode = AliensGlobalInstance.instance.levels.children[0];
                    const remain = levelNode.getChildByName('et')!.children.length;

                    if (remain > 1) {
                        EventDispatcher.instance.emit(GameEvent.EVENT_CAMERA_SHOOT_TEXT);
                        EventDispatcher.instance.emit(GameEvent.EVENT_CAMERA_SHOOT_ENEMY, hitNode);
                    } else {
                        const origin = levelNode.getChildByName('origin')!;
                        const target = hitNode;
                        EventDispatcher.instance.emit(GameEvent.EVENT_LAST_ENEMY_KILLED);
                        TimerMgr.inst.pauseCountdown();
                        AliensGlobalInstance.instance.guns.active = false;
                        CameraSegmentation.segmentation(origin, target);
                        this.scheduleOnce(() => {
                            EventDispatcher.instance.emit(GameEvent.EVENT_CAMERA_SHOOT_ENEMY, hitNode);
                        }, (moveDuration + 1) / 10);
                    }
                }
            }
        }

        LevelManager.instance.levelModel.shootCount++;
    }

    //相机转向目标
    private async onCameraToTarget(targetNode: Node) {
        const camera = this.camera;
        if (!targetNode || !camera) return;

        const targetPos = new Vec3();
        targetNode.getWorldPosition(targetPos);

        // 获取相机位置
        const cameraPos = new Vec3();
        camera.node.getWorldPosition(cameraPos);

        // 计算从相机到目标的方向向量
        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, cameraPos);
        direction.normalize();

        // 计算目标欧拉角
        const targetYaw = math.toDegree(Math.atan2(-direction.x, -direction.z));
        const targetPitch = math.toDegree(Math.asin(direction.y));

        // 获取当前欧拉角
        const currentRotation = camera.node.eulerAngles.clone();

        // 创建一个对象用于tween
        const tweenObj = {
            pitch: currentRotation.x,
            yaw: currentRotation.y
        };

        this._isZoomed = true;
        tween(tweenObj)
            .to(ANIMATION_DURATION, {
                pitch: targetPitch,
                yaw: targetYaw
            }, {
                easing: 'smooth',
                onUpdate: () => {
                    // 更新相机旋转
                    camera.node.setRotationFromEuler(tweenObj.pitch, tweenObj.yaw, 0);
                },
                onComplete: () => {
                    this._isZoomed = false;
                }
            })
            .start();
    }


    /***************************触摸事件**********************************/
    private _onTouchStart(event: EventTouch) {
        const radarComponent = AliensGlobalInstance.instance.renderNode.getComponent(RadarComponent)!;
        if (radarComponent) {
            radarComponent.unlockPositionUpdate();
        }
    }

    private async _onTouchMove(event: EventTouch) {
        const delta = event.getDelta();

        // 获取当前相机旋转
        const currentRotation = new Vec3();
        this.camera.node.rotation.getEulerAngles(currentRotation);

        // 计算新角度
        currentRotation.y -= delta.x * this.rotateSpeed;
        currentRotation.x += delta.y * this.rotateSpeed;

        // 限制水平旋转角度(基于初始角度)
        currentRotation.y = Math.max(
            this._initialRotation.y - this.horizontalLimit,
            Math.min(this._initialRotation.y + this.horizontalLimit, currentRotation.y)
        );

        // 限制垂直旋转角度(基于初始角度)
        currentRotation.x = Math.max(
            this._initialRotation.x - this.verticalLimit,
            Math.min(this._initialRotation.x + this.verticalLimit, currentRotation.x)
        );

        // 应用旋转
        const rotation = new Quat();
        Quat.fromEuler(rotation, currentRotation.x, currentRotation.y, 0);
        this.camera.node.setRotation(rotation);
        await this.saveCameraState();
    }

    //保存相机的位置和旋转角度
    private async saveCameraState() {
        const cameraOriginalPos = this.camera.node.worldPosition.clone();
        const originalRotation = this.camera.node.eulerAngles.clone();
        const screenShot = AliensGlobalInstance.instance.renderNode.getComponent(ScreenShotComponent)!;
        screenShot.saveCameraState(cameraOriginalPos, originalRotation);
    }

    private _onTouchEnd() {
        const radarComponent = AliensGlobalInstance.instance.renderNode.getComponent(RadarComponent)!;
        if (radarComponent) {
            radarComponent.unlockPositionUpdate();
        }
    }

    /***************************触摸事件end**********************************/

    onDestroy() {
        Tween.stopAllByTarget(this.node);
        this.unRegisterEvent();
        if (this._renderTex) {
            this._renderTex.destroy();
            this._renderTex = null;
        }
    }
}

