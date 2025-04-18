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

const { ccclass, property } = _decorator;
//动画时长
export const ANIMATION_DURATION = 0.5;

@ccclass('LevelAction')
export class LevelAction extends Component {

    @property(Camera)
    public camera: Camera = null!;

    private _renderTex: RenderTexture | null = null;
    private _cameraOriginalPos: Vec3 = v3();
    private _touchStartPos: Vec3 = v3();
    private _isDragging = false;
    private _isZooming = false;
    public targetNode: Node = null!;

    //关卡怪物总数
    @property({type: CCFloat,displayName:"怪物总数"})
    public enemyTotal: number = 0;

    // 添加旋转限制属性
    @property({type: CCFloat ,displayName:"相机X轴最小旋转角度(上下)"})
    public minXRotation: number = -30;  // X轴最小旋转角度(上下)
    @property({type: CCFloat ,displayName:"相机X轴最大旋转角度(上下)"}) 
    public maxXRotation: number = 30;   // X轴最大旋转角度(上下)
    @property({type: CCFloat ,displayName:"相机Y轴最小旋转角度(左右)"})
    public minYRotation: number = -50;  // Y轴最小旋转角度(左右)
    @property({type: CCFloat ,displayName:"相机Y轴最大旋转角度(左右)"})
    public maxYRotation: number = 50;   // Y轴最大旋转角度(左右)
    private _originalRotation: Vec3 = v3();

    //镜头拉近属性
    private isTweening: boolean = false;

    onLoad(): void {
        this._cameraOriginalPos = this.camera.node.position.clone();
        this._originalRotation = this.camera.node.eulerAngles.clone();
        this.registerEvent();
    }

    start() {
        this.initilizeUI();
        this.saveCameraState();

        EventDispatcher.instance.emit(GameEvent.EVENT_INIT_REMAIN_ENEMY,this.enemyTotal);
    }

    private initilizeUI(){
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

    private registerEvent(){
        // 触摸事件监听
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);

        //事件监听
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_AIM,this.onAimTarget,this);
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_RESET_AIM,this.onResetAimTarget,this);
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_SHOOT,this.onShoot,this);
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_SCREENSHOT_RADAR_LOCK,this.onCameraToTarget,this);
    }

    private unRegisterEvent(){
        // 触摸事件监听
        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this); 
        input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);

        //事件监听
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_AIM,this.onAimTarget,this);
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_RESET_AIM,this.onResetAimTarget,this);
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_SHOOT,this.onShoot,this);
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_SCREENSHOT_RADAR_LOCK,this.onCameraToTarget,this);
    }

    private onAimTarget(){
        this.moveCameraAlongForward(-30); // 负值表示拉近
    }

    private onResetAimTarget(){
        this.moveCameraAlongForward(30); // 正值表示拉远
    }

    private onShoot(){
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
                // console.log(`碰撞物体${i}: ${hitNode.name} 距离: ${item.distance.toFixed(2)}`);

                if(hitNode.getComponent(EnemyComponent)){
                    EventDispatcher.instance.emit(GameEvent.EVENT_CAMERA_SHOOT_TEXT);
                    EventDispatcher.instance.emit(GameEvent.EVENT_CAMERA_SHOOT_ENEMY,hitNode);
                }
            }
        }
    }
    
    private moveCameraAlongForward(distance: number) {
        if(this._isZooming) return;

        this._isZooming = true;
        const currentPos = this.camera.node.position.clone();
        const forward = this.camera.node.forward.negative();
        const targetPos = currentPos.add(forward.multiplyScalar(distance));
        
        tween(this.camera.node.position)
            .to(ANIMATION_DURATION, targetPos, {
                easing: 'smooth',
                onUpdate: (target: Vec3) => {
                    this.camera.node.position = target;
                    // 根据镜头距离动态调整旋转限制
                    this.adjustRotationLimits();
                    this._isZooming = false; 
                }
            })
            .start();
    }

    //相机转向目标
    private async onCameraToTarget(targetNode: Node){
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
 
         this.isTweening = true;
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
                     this.isTweening = false;
                 }
             })
             .start();
    }

    private adjustRotationLimits() {
        // 计算当前镜头距离比例 (0-1范围)
        const distanceRatio = Math.min(1, Math.max(0, (this.camera.node.position.z - this._cameraOriginalPos.z) / -30));
        
        // 动态调整旋转限制范围
        const dynamicMinY = this.minYRotation * (1 + distanceRatio);
        const dynamicMaxY = this.maxYRotation * (1 + distanceRatio);
        
        // 应用调整后的限制
        this.minYRotation = dynamicMinY;
        this.maxYRotation = dynamicMaxY;
    }

    /***************************触摸事件**********************************/
    private _onTouchStart(event: EventTouch) {
        const touchPos = event.getLocation();
        this._touchStartPos = v3(touchPos.x, touchPos.y, 0);
        this._isDragging = true;
        // 记录初始旋转角度
        this._originalRotation = this.camera.node.eulerAngles.clone();

        const radarComponent = AliensGlobalInstance.instance.renderNode.getComponent(RadarComponent)!;
        if(radarComponent){
            radarComponent.unlockPositionUpdate();
        }
    }
    
    private async _onTouchMove(event: EventTouch) {
        if (!this._isDragging) return;
        
        const currentPos = event.getLocation();
        const deltaX = currentPos.x - this._touchStartPos.x;
        const deltaY = currentPos.y - this._touchStartPos.y;
        
        // 仅计算旋转角度变化
        const newRotation = this._originalRotation.clone();
        newRotation.y = this._originalRotation.y - deltaX * 0.2;
        newRotation.x = this._originalRotation.x + deltaY * 0.2;
        
        // 添加旋转限制
        newRotation.x = Math.max(this.minXRotation, Math.min(this.maxXRotation, newRotation.x));
        newRotation.y = Math.max(this.minYRotation, Math.min(this.maxYRotation, newRotation.y));
        
        this.camera.node.setRotationFromEuler(newRotation);
        await this.saveCameraState();
    }

    //保存相机的位置和旋转角度
    private async saveCameraState() {
        const cameraOriginalPos = this.camera.node.worldPosition.clone();
        const originalRotation = this.camera.node.eulerAngles.clone(); 
        const screenShot = AliensGlobalInstance.instance.renderNode.getComponent(ScreenShotComponent)!;
        screenShot.saveCameraState(cameraOriginalPos,originalRotation);
    }

    private _onTouchEnd() {
        this._isDragging = false;

        const radarComponent = AliensGlobalInstance.instance.renderNode.getComponent(RadarComponent)!;
        if(radarComponent){
            radarComponent.unlockPositionUpdate();
        }
    }

 /***************************触摸事件end**********************************/

    onDestroy () {
        Tween.stopAllByTarget(this.node);
        this.unRegisterEvent();
        if (this._renderTex) {
            this._renderTex.destroy();
            this._renderTex = null;
        }
    }
}

