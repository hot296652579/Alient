import { Tablemain_config } from "db://assets/module_basic/table/Tablemain_config";

export class UserModel {
    money: number = 0;
    nickName: string = 'player'; //昵称
    //强制广告间隔次数
    forceAdCount: number = 0;

    //观看广告获得体力
    powerAddByAd: number = 0;

    //复活增加时间
    reviveAddTime: number = 0;

    //嘲讽间隔时间
    tauntIntervalTime: number = 0;

    //关卡剩余时间不足提示
    levelTimeLessTip: number = 0;

    //恢复体力时间 5s
    powerRecoverTime: number = 1;
    //自然恢复体力最大值
    powerMax: number = 1;
    //当前体力
    powerCurrent: number = 0;

    //情报免费次数
    radarFreeCount: number = 0;

    //侦探免费次数
    freeScreenShotCount: number = 0;

    //开镜后放大后倍率
    magnifyRate: number = 1;

    mainConfig:Tablemain_config = null;

    constructor() {
        this.mainConfig =  new Tablemain_config();
    }

    initialize() {
       this.money = 0;
       this.powerCurrent = 1;
       this.powerRecoverTime = this.getPramById(5);
       this.powerMax = this.getPramById(4);
       this.radarFreeCount = this.getPramById(3);
       this.freeScreenShotCount = this.getPramById(2);
       this.powerAddByAd = this.getPramById(6);
       this.reviveAddTime = this.getPramById(7);
       this.tauntIntervalTime = this.getPramById(8);
       this.levelTimeLessTip = this.getPramById(9);
       this.magnifyRate = this.getPramById(10);
    }

    getPramById(id: number) {
        this.mainConfig.init(id);
        const param = this.mainConfig.param;
        return param
    }
}
