import { _decorator, Camera, Component, Node, UITransform, Vec3, view } from 'cc';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
import { AliensGlobalInstance } from '../AliensGlobalInstance';
import { GameUtil } from '../GameUtil';
const { ccclass, property } = _decorator;

@ccclass('RadarComponent')
export class RadarComponent extends Component {

    //渲染的目标节点
    private _targetNode: Node = null!;

    private _shouldUpdatePosition = true;

    private _index = 0;

    protected onLoad(): void {
        this.registerEvent();
    }

    private registerEvent(){
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_SCREENSHOT_RADAR,this.onRadar,this);
        EventDispatcher.instance.on(GameEvent.EVENT_CAMERA_SHOOT_ENEMY,this.cancelRadar,this);
    }

    private unregisterEvent(){
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_SCREENSHOT_RADAR,this.onRadar,this);
        EventDispatcher.instance.off(GameEvent.EVENT_CAMERA_SHOOT_ENEMY,this.cancelRadar,this);
    }

    private async onRadar(){
        this.node.active = true;
        this._shouldUpdatePosition = true;

        //获取相机
        const camera = await this.getSceneCamera();
        //获取目标节点
        this._targetNode = await this.getTargetNode();
        
        if(this._targetNode){
            const battleUI = AliensGlobalInstance.instance.battleUI;
            const localPos = GameUtil.worldToScreenLocal(this._targetNode,battleUI,camera);
            
            // 移动雷达指示器
            this.node.setPosition(localPos);
            EventDispatcher.instance.emit(GameEvent.EVENT_CAMERA_SCREENSHOT_RADAR_LOCK,this._targetNode); // 发送事件通知相机已准备好进行截图，传递当前的 _targetNode 作为参数，用于在相机组件中获取目标节点的位置和旋转信息。
        }
    }

    private cancelRadar(){
        console.log('取消雷达');
        this.node.active = false;
        this._shouldUpdatePosition = false;
    }

    public lockPositionUpdate() {
        this._shouldUpdatePosition = false;
    }

    public unlockPositionUpdate() {
        this._shouldUpdatePosition = true;
    }

    update(deltaTime: number) {
        if(this._shouldUpdatePosition && this._targetNode) {
            const battleUI = AliensGlobalInstance.instance.battleUI;
            const camera = this.node.scene.getComponentInChildren(Camera);
            const localPos = GameUtil.worldToScreenLocal(this._targetNode, battleUI, camera);
            this.node.setPosition(localPos);
        }
    }

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
            // resolve(et.children[1]);
        });
    }

    protected onDestroy(): void {
        this.unregisterEvent();
    }
}


