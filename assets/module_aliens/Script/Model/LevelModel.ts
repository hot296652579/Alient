import { JsonUtil } from "db://assets/core_tgx/base/utils/JsonUtil";
import { Tablelevels_config } from "../../../module_basic/table/Tablelevels_config";
import { GlobalConfig } from "../../../start/Config/GlobalConfig";
import { sys } from "cc";
import { AliensGlobalInstance } from "../AliensGlobalInstance";

/**关卡数据模型
 */
export class LevelModel {
    public levelConfig: Tablelevels_config;

    /**关卡时长*/
    public levelTime: number = 0;
    /**关卡奖励*/
    public levelReward: number = 0;

    /** 射击次数*/
    public shootCount: number = 0;
    /** 击中次数*/
    public hitCount: number = 0;
    /** 爆头次数*/
    public headshotCount: number = 0;

    /** 当前关卡等级*/
    public level: number = 1;
    /** 保存可随机的关卡*/
    public randomLevelList: number[] = [];
    /** 输赢*/
    public isWin: boolean = false;
    /** 是否结束*/
    public isEnd: boolean = false;

    constructor() {
        this.levelConfig = new Tablelevels_config();
        this.getRandomLevelList();

        const isDebug = GlobalConfig.isDebug;
        if (isDebug) {
            this.level = GlobalConfig.initilizeLevel;
        } else {
            const level = sys.localStorage.getItem('alient_level');
            if (!level) {
                this.level = 1;
            } else {
                if (level > GlobalConfig.levelTotal) {
                    const randomLevel = this.randomLevelList[Math.floor(Math.random() * this.randomLevelList.length - 1)];
                    this.level = randomLevel;
                } else {
                    this.level = parseInt(level);
                }
            }
        };
        this.setLevelConfig(this.level);
    }

    setLevelConfig(level: number) {
        this.levelConfig.init(level); 
        this.levelTime = this.levelConfig.eliminate;
        this.levelReward = this.levelConfig.target;
    }

    /** 可随机的关卡合集*/
    getRandomLevelList() {
        const table = JsonUtil.get(Tablelevels_config.TableName);
        if (!table) {
            console.warn('Get level table is fail!');
        }
        this.randomLevelList = Object.values(table).filter(item => item['random'] == 1)
            .map(item => item['level']);

        // console.log('随机关卡列表:', this.randomLevelList);
    }

    /** 清除关卡数据*/
    clearLevel() {
        this.isWin = false;
        this.isEnd = false;
        this.shootCount = 0;
        this.hitCount = 0;
        this.headshotCount = 0;
    }

}