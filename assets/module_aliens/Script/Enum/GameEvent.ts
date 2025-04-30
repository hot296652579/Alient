export class GameEvent {
    /** 通知UI实例化*/
    static readonly EVENT_UI_INITILIZE = 'EVENT_UI_INITILIZE';
    /** 游戏开始*/
    static readonly EVENT_GAME_START = 'EVENT_GAME_START';
    /** 进入游戏*/
    static readonly EVENT_GAME_ENTER = 'EVENT_GAME_ENTER';
    /** 游戏暂停*/
    static readonly EVENT_GAME_PAUSE = 'EVENT_GAME_PAUSE';

    /** 刷新玩家信息*/
    static readonly EVENT_REFRESH_PLAYER_INFO = 'EVENT_REFRESH_PLAYER_INFO';

    /**初始化剩余怪物 */
    static readonly EVENT_INIT_REMAIN_ENEMY = 'EVENT_INIT_REMAIN_ENEMY';

    /** 击杀最后一个怪物*/
    static readonly EVENT_LAST_ENEMY_KILLED = 'EVENT_LAST_ENEMY_KILLED';

    /** 游戏倒计时开始*/
    static readonly EVENT_GAME_COUNTDOWN_START = 'EVENT_GAME_COUNTDOWN_START';

    /** 瞄准镜头*/
    static readonly EVENT_CAMERA_AIM = 'EVENT_CAMERA_AIM';

    /** 取消瞄准*/
    static readonly EVENT_CAMERA_RESET_AIM = 'EVENT_CAMERA_RESET_AIM';

    /** 发射射击*/
    static readonly EVENT_CAMERA_SHOOT = 'EVENT_CAMERA_SHOOT';

    /** 截图事件*/
    static readonly EVENT_CAMERA_SCREENSHOT = 'EVENT_CAMERA_SCREENSHOT';

    /** 侦探事件*/
    static readonly EVENT_CAMERA_SCREENSHOT_RADAR = 'EVENT_CAMERA_SCREENSHOT_RADAR';

    /** 取消侦探*/
    static readonly EVENT_CAMERA_SCREENSHOT_RADAR_CANCEL = 'EVENT_CAMERA_SCREENSHOT_RADAR_CANCEL';

    /** 相机对准目标*/
    static readonly EVENT_CAMERA_SCREENSHOT_RADAR_LOCK = 'EVENT_CAMERA_SCREENSHOT_RADAR_LOCK';

    /** 击中文本提示测试*/
    static readonly EVENT_CAMERA_SHOOT_TEXT = 'EVENT_CAMERA_SHOOT_TEXT';

    /** 击中了怪物 外星人*/
    static readonly EVENT_CAMERA_SHOOT_ENEMY = 'EVENT_CAMERA_SHOOT_ENEMY';

    /** 检测游戏是否结束*/
    static readonly EVENT_CHECK_GAME_OVER = 'EVENT_CHECK_GAME_OVER';

    /** 闯关成功 关卡升级*/
    static readonly EVENT_BATTLE_SUCCESS_LEVEL_UP = 'EVENT_BATTLE_SUCCESS_LEVEL_UP';

    /** 闯关失败 关卡重载*/
    static readonly EVENT_BATTLE_FAIL_LEVEL_RESET = 'EVENT_BATTLE_FAIL_LEVEL_RESET';
}