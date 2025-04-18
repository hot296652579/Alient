/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2025-01-02 20:28:35
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2025-01-02 20:49:14
 * @FilePath: /MoveCarUnscrew/assets/module_movecar/Script/CarColorsGlobalTypes.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export enum CarTypes {
    Single,
    Sedan,
    Bus,
    Minivan,
}

export enum CarDir {
    TOP,
    BOTTOM,
    LEFT,
    RIGHT,
}

export enum CarColors {
    Blue = 1,
    Green = 2,
    Red = 3,
    Cyan = 4,
    Yellow = 5,
    Pink = 6,
    Purple = 7,
    Brown = 8,
    Black = 9,
    SpriteWhite = 10
}

export const CarColorLog: Record<CarColors, string> = {
    [CarColors.Blue]: "蓝色",
    [CarColors.Green]: "绿色",
    [CarColors.Red]: "红色",
    [CarColors.Cyan]: "青色",
    [CarColors.Yellow]: "黄色",
    [CarColors.Pink]: "粉色",
    [CarColors.Purple]: "紫色",
    [CarColors.Brown]: "棕色",
    [CarColors.Black]: "黑色",
    [CarColors.SpriteWhite]: "精灵白色",
};

// 定义对应的十六进制颜色值
export const CarColorHex: Record<CarColors, string> = {
    [CarColors.Blue]: "#1B24F0",
    [CarColors.Green]: "#1BF01B",
    [CarColors.Red]: "#F0241B",
    [CarColors.Cyan]: "#9aeeca",
    [CarColors.Yellow]: "#EBF32A",
    [CarColors.Pink]: "#EB88BB",
    [CarColors.Purple]: "#F32AF3",
    [CarColors.Brown]: "#F5A71D",
    [CarColors.Black]: "#968a6c",
    [CarColors.SpriteWhite]: "#FFFFFF",
};

/**道具类型
 * @param REFRESH 刷新
 * @param MAGNET 磁铁
*/
export enum TYPE_ITEM {
    REFRESH = 1,
    MAGNET = 2,
}