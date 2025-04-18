import { _decorator, Camera, Component, Node, RenderTexture, Sprite, SpriteFrame, Vec3 } from 'cc';
import { AliensGlobalInstance } from '../AliensGlobalInstance';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
import { GameUtil } from '../GameUtil';
import { tgxUITips } from 'db://assets/core_tgx/tgx';
const { ccclass, property } = _decorator;
/** 截图组件脚本*/
@ccclass('ScreenShotComponent')
export class ScreenShotComponent extends Component {

    @property(Sprite)
    public sprite: Sprite = null!;

    _renderTex: RenderTexture | null = null;

    private _originalTargetTexture: RenderTexture | null = null;
    private _originalCameraPosition: Vec3 = new Vec3();
    private _originalCameraRotation: Vec3 = new Vec3();

    private _index:number = 0;

    //渲染的目标节点
    private _targetNode: Node = null!;

    protected onLoad(): void {
        this.registerEvent();
    }

    private registerEvent(){
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_SCREENSHOT,this.screenShot,this);
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_SHOOT_ENEMY,this.shootEnemy,this);
    }

    private unregisterEvent(){
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_SCREENSHOT,this.screenShot,this); 
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_SHOOT_ENEMY,this.shootEnemy,this);
    }

    //截图
    public async screenShot() {
        this.node.active = true;
        //获取相机组件 
        const camera = await this.getSceneCamera();
        //获取目标节点
        this._targetNode = await this.getTargetNode();

        const spriteFrame = this.sprite.spriteFrame!;
        const sp = new SpriteFrame();
        sp.reset({
            originalSize: spriteFrame.originalSize,
            rect: spriteFrame.rect,
            offset: spriteFrame.offset,
            isRotate: spriteFrame.rotated,
            borderTop: spriteFrame.insetTop,
            borderLeft: spriteFrame.insetLeft,
            borderBottom: spriteFrame.insetBottom,
            borderRight: spriteFrame.insetRight,
        });
    
        const renderTex = this._renderTex = new RenderTexture();
        renderTex.reset({
            width: 280,  // 直接设置为最终大小
            height: 180,
        });

        if (this._targetNode) {
            // 设置渲染纹理
            sp.texture = renderTex;
            // 设置flipUV来翻转图像
            sp.flipUVY = true;
            this.sprite.spriteFrame = sp;

            // 移动相机对准目标节点
            const targetPos = this._targetNode.worldPosition.clone();
            // 计算相机新位置：从目标位置向后移动2个单位
            const cameraOffset = new Vec3(0, 0, 10); // 调整这个值可以改变相机距离
            const cameraPos = new Vec3();
            Vec3.add(cameraPos, targetPos, cameraOffset);

            camera.node.setWorldPosition(cameraPos);
            camera.node.lookAt(targetPos, Vec3.UP);
            camera.targetTexture = renderTex;
            
            // 确保渲染完成
            this.scheduleOnce(() => {
                // 恢复相机状态
                camera.targetTexture = this._originalTargetTexture;
                camera.node.setWorldPosition(this._originalCameraPosition);
                camera.node.setRotationFromEuler(this._originalCameraRotation);
                // 强制更新材质
                this.sprite.markForUpdateRenderData();
            }, 0.1);
        }
    }

    //击杀了场景怪物 隐藏侦探节点
    private shootEnemy(enemy:Node){
        if(!this.node.active || !this._targetNode) return;
        
        if(enemy == this._targetNode){
            this.scheduleOnce(() => {
                tgxUITips.show('击杀的怪物是侦探上的!');
                this.node.active = false; 
            },1);
        }
    }

    //获取场景相机
    private async getSceneCamera() :Promise<Camera>{
        return new Promise<Camera>((resolve, reject) => {
            const levelNode = AliensGlobalInstance.instance.levels.children[0];
            if(!levelNode){return;}

            const camera = levelNode.getComponentInChildren(Camera)!;
            resolve(camera);
        });
    }

    //获取目标节点
    private  async getTargetNode():Promise<Node> {
        return new Promise<Node>((resolve, reject) => {
            const levelNode = AliensGlobalInstance.instance.levels.children[0];
            const et = levelNode.getChildByName('et');

            this._index++;
            if(this._index >= et.children.length){
                this._index = 0;
            }
            
            resolve(et.children[this._index]);
        });
    }

    //更新相机最新的位置和旋转角度
    public saveCameraState(pos:Vec3,rotation:Vec3){
        this._originalCameraPosition = pos;
        this._originalCameraRotation = rotation;
        // console.log('保存相机最新的位置和旋转角度:',pos,',',rotation);
    }

    protected onDestroy(): void {
        this.unregisterEvent();
    }
}


