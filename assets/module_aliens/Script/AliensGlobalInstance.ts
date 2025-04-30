/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2025-01-01 09:28:17
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2025-01-01 18:28:17
 * @FilePath: /MoveCarUnscrew/assets/module_movecar/Script/AliensGlobalInstance.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { _decorator, assetManager, Camera, Component, find, Label, Node, Prefab } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AliensGlobalInstance')
export class AliensGlobalInstance extends Component {
    private static _instance: AliensGlobalInstance;
    public static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new AliensGlobalInstance();
        return this._instance;
    }

    public async initUI() {
        this.camera = find("Canvas/Camera").getComponent(Camera)!;
        this.levels = find("Canvas/Scene/Levels");
        this.homeUI = find("Canvas/GameUI/HomeUI");
        this.battleUI = find("Canvas/GameUI/BattleUI");
        this.bottomBtn = find("Canvas/GameUI/BattleUI/BottomBtns");
        this.topLeftNode = find("Canvas/GameUI/TopLeft");
        this.titleLvl = find("Canvas/GameUI/BattleUI/TitleLvl");
        this.aimNode = find("Canvas/GameUI/BattleUI/AimNode");
        this.aimTarget = find("Canvas/GameUI/BattleUI/AimTarget");
        this.radarNode = find("Canvas/GameUI/BattleUI/Radar");
        this.lbTestShoot = find("Canvas/GameUI/BattleUI/LbTestShoot").getComponent(Label)!;
        this.renderNode = find("Canvas/GameUI/BattleUI/Render");
        this.guns = find("Canvas/GameUI/BattleUI/Guns");
    }

    public camera: Camera = null!; //相机
    public levels: Node = null!;
    public homeUI: Node = null!;
    public battleUI: Node = null!;

    public bottomBtn: Node = null!; //底部按钮
    public topLeftNode: Node = null!; 
    public titleLvl: Node = null!; //标题
    public aimNode: Node = null!; //瞄准节点
    public aimTarget: Node = null!; //瞄准放大节点
    public radarNode: Node = null!; //侦擦节点
    public lbTestShoot:Label = null!; //测试射击
    public guns:Node = null!; //测试射击

    public renderNode: Node = null!; //渲染节点
}


