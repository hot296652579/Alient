import { _decorator, Camera, Component, Node, Quat, RenderTexture, Sprite, SpriteFrame, Vec3 } from 'cc';
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
    // private _originalCameraRotation: Vec3 = new Vec3();

    private _originalCameraRotation: Quat = new Quat(); 

    private _shouldFlipImage: boolean = true; 

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
        const camera = await this.getSceneCamera();
        this._targetNode = await this.getTargetNode();

        if (!this._targetNode) return;

        // 创建新的RenderTexture
        const renderTex = new RenderTexture();
        renderTex.reset({
            width: 150,
            height: 110,
        });

        // 创建新的SpriteFrame并设置翻转
        const newSpriteFrame = new SpriteFrame();
        newSpriteFrame.texture = renderTex;
        // console.log(`this._shouldFlipImage:${this._shouldFlipImage}`);
        newSpriteFrame.flipUVY = this._shouldFlipImage; // 使用SpriteFrame的翻转功能
        
        // 保存原始相机状态
        this._originalTargetTexture = camera.targetTexture;
        camera.node.getWorldPosition(this._originalCameraPosition);
        camera.node.getWorldRotation(this._originalCameraRotation);

        // 设置相机位置和朝向
        const targetPos = this._targetNode.worldPosition.clone();
        const cameraPos = targetPos.add(new Vec3(0, 0, 10));
        camera.node.setWorldPosition(cameraPos);
        camera.node.lookAt(targetPos, Vec3.UP);
        camera.targetTexture = renderTex;

        // 等待一帧确保渲染完成
        await new Promise(resolve => this.scheduleOnce(resolve, 0));

        // 更新Sprite显示
        this.sprite.spriteFrame = newSpriteFrame;
        this.sprite.markForUpdateRenderData(true);

        // 恢复相机状态
        camera.targetTexture = this._originalTargetTexture;
        camera.node.setWorldPosition(this._originalCameraPosition);
        camera.node.setRotation(this._originalCameraRotation);
    }

    private _shootCount: number = 0;
    //击杀了场景怪物 隐藏侦探节点
    private shootEnemy(enemy:Node){
        if(!this.node.active || !this._targetNode) return;
        
        if(enemy == this._targetNode){
            this.scheduleOnce(() => {
                tgxUITips.show('击杀的怪物是侦探上的!');
                this._shootCount++; // 增加计数
                if(this._shootCount > 0){
                    this._shouldFlipImage = false; 
                }
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
    public saveCameraState(pos: Vec3, rotation: Vec3) {
        this._originalCameraPosition = pos;
        // 将Vec3欧拉角转换为Quat
        const quat = new Quat();
        Quat.fromEuler(quat, rotation.x, rotation.y, rotation.z);
        this._originalCameraRotation.set(quat);
    }

    protected onDestroy(): void {
        this.unregisterEvent();
    }
}


