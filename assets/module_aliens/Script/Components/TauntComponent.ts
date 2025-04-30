import { _decorator, Component, Label, Node, tween, UITransform, Vec3, view } from 'cc';
import { UserManager } from '../Manager/UserMgr';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
const { ccclass, property } = _decorator;

//嘲讽文本
const tauntTxt = [
    'Your level is also too poor',
    'You loser',
    'It would have been over long ago if someone else came'
]

@ccclass('TauntComponent')
export class TauntComponent extends Component {

    @property(Label)
    tauntLabel: Label = null!;

    private _originPos:Vec3 = null!;
    private _isAnimating: boolean = false;

    //嘲讽时间间隔
    tauntIntervalTime: number = 0;

    start() {
        const tauntTime = UserManager.instance.userModel.tauntIntervalTime
        this.tauntIntervalTime = tauntTime;
        // this.tauntIntervalTime = 5;//测试

        this._originPos = this.node.position.clone();
        EventDispatcher.instance.on(GameEvent.EVENT_GAME_COUNTDOWN_START,this.startTauntSchedule,this)
    }

    private startTauntSchedule() {
        this.schedule(this.playTauntAnimation, this.tauntIntervalTime);
    }

    //嘲讽动画
    taunt() {
        if(this._isAnimating) return;
        this._isAnimating = true;
        
        // 设置随机嘲讽文本
        this.tauntLabel.string = this.getRandomTauntTxt();
        
        // 计算屏幕左侧位置
        const screenLeft = -view.getVisibleSize().width / 2;
        const width = this.node.getComponent(UITransform).width;
        const targetPos = new Vec3(screenLeft + width / 2, this._originPos.y, this._originPos.z);
        
        // 动画到屏幕左侧(1秒)
        tween(this.node.position)
            .to(1, targetPos, {
                easing: 'quadOut',
                onUpdate: (target: Vec3) => {
                    this.node.position = target;
                }
            })
            .call(() => {
                // 停留1秒后再执行返回动画
                this.scheduleOnce(() => {
                    tween(this.node.position)
                        .to(2, this._originPos, {
                            easing: 'quadIn',
                            onUpdate: (target: Vec3) => {
                                this.node.position = target;
                            },
                            onComplete: () => {
                                this._isAnimating = false;
                            }
                        })
                        .start();
                }, 1);
            })
            .start();
    }

    // 定时播放嘲讽动画
    private playTauntAnimation() {
        this.taunt();
    }

    //随机获取嘲讽文本
    getRandomTauntTxt() {
        const index = Math.floor(Math.random() * tauntTxt.length);
        return tauntTxt[index];
    }

    protected onDestroy(): void {
        this.unschedule(this.playTauntAnimation);
        EventDispatcher.instance.off(GameEvent.EVENT_GAME_COUNTDOWN_START,this.startTauntSchedule,this)
    }
}


