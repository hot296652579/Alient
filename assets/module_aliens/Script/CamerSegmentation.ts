import { Vec2, Node, v2, PolygonCollider2D, Rect, CircleCollider2D, AssetManager, Prefab, instantiate, Vec3, Camera, director, tween } from "cc";
import { resLoader } from "../../core_tgx/base/ResLoader";
import { AliensGlobalInstance } from "./AliensGlobalInstance";

export const  moveDuration: number = 2.5;
/** 相机镜头切分 */
export class CameraSegmentation {

    static cameraFollowDistance: number = 5;

    static cameraHeight: number = 2;

    static async segmentation(_origin:Node,_target:Node) {
            // 重置子弹位置和朝向
            const bullet = await this.loadBullet();
            const levelNode = AliensGlobalInstance.instance.levels.children[0];
            levelNode.addChild(bullet);
            bullet.setWorldPosition(_origin.worldPosition.clone());
            bullet.lookAt(_target.worldPosition, Vec3.UP);
        
            // 计算子弹路径中点
            const midPoint = new Vec3();
            Vec3.lerp(midPoint, _origin.worldPosition, _target.worldPosition, 0.5);
        
            // 计算子弹飞行方向向量
            const bulletDirection = new Vec3();
            Vec3.subtract(bulletDirection, _target.worldPosition, _origin.worldPosition);
            Vec3.normalize(bulletDirection, bulletDirection);
    
            // 1. 起始位置 - 子弹正后方
            const startCameraPos = new Vec3();
            Vec3.scaleAndAdd(startCameraPos, _origin.worldPosition, bulletDirection, -this.cameraFollowDistance * 2);
            startCameraPos.y += this.cameraHeight; // 添加高度偏移
    
            // 2. 中间位置 - 子弹侧后方45度
            const midCameraPos = new Vec3();
            const sideOffset = new Vec3(-bulletDirection.z, 0, bulletDirection.x); // 计算侧向偏移
            Vec3.scaleAndAdd(midCameraPos, midPoint, bulletDirection, -this.cameraFollowDistance);
            Vec3.scaleAndAdd(midCameraPos, midCameraPos, sideOffset, this.cameraFollowDistance);
            midCameraPos.y += this.cameraHeight * 1.5;
    
            // 3. 结束位置 - 目标侧方45度
            const endCameraPos = new Vec3();
            const targetSideOffset = new Vec3(-bulletDirection.z, 0, bulletDirection.x); // 计算目标侧向偏移
            Vec3.scaleAndAdd(endCameraPos, _target.worldPosition, bulletDirection, -this.cameraFollowDistance * 0.5); // 稍微后退
            Vec3.scaleAndAdd(endCameraPos, endCameraPos, targetSideOffset, this.cameraFollowDistance); // 侧向偏移
            endCameraPos.y += this.cameraHeight * 1; // 适当高度
    
            // 设置相机初始位置和朝向
            let camera = await this.getSceneCamera();
            // camera.node.setRotationFromEuler(0, 0, 0); // 重置旋转
            camera.node.setWorldPosition(startCameraPos);
            camera.node.lookAt(_target.worldPosition); // 初始看向目标
        
            // 设置更慢的全局时间
            director.getScheduler().setTimeScale(0.1);
        
            // 三阶段镜头运动
            tween(bullet)
                .to(moveDuration, 
                    { worldPosition: _target.worldPosition.clone() },
                    {
                        onUpdate: (target, ratio) => {
                            let currentCameraPos = new Vec3();
                            let lookAtPos = new Vec3();
                            
                            if (ratio! < 0.6) {
                                Vec3.lerp(currentCameraPos, startCameraPos, midCameraPos, ratio! / 0.6);
                                Vec3.lerp(lookAtPos, _origin.worldPosition, midPoint, ratio! / 0.6);
                            } 
                            else if (ratio! < 0.9) {
                                Vec3.lerp(currentCameraPos, midCameraPos, endCameraPos, (ratio! - 0.6) / 0.3);
                                lookAtPos = bullet.worldPosition; // 中间阶段跟随子弹
                            } else {
                                currentCameraPos = endCameraPos.clone();
                                lookAtPos = _target.worldPosition; // 最后阶段看向目标
                            }
                            
                            camera.node.setWorldPosition(currentCameraPos);
                            camera.node.lookAt(lookAtPos);
                        },
                        onComplete: () => {
                            director.getScheduler().setTimeScale(1.0);
                        }
                    }
                )
                .start();
    }

    //获取主相机
    static async getSceneCamera() :Promise<Camera>{
        return new Promise<Camera>((resolve, reject) => {
            const levelNode = AliensGlobalInstance.instance.levels.children[0];
            if(!levelNode){return;}

            const camera = levelNode.getComponentInChildren(Camera)!;
            resolve(camera);
        });
    }

    //异步加载子弹
    static async loadBullet(): Promise<Node> {
        return new Promise<Node>((resolve, reject) => {
            resLoader.loadAsync(resLoader.gameBundleName, `Prefabs/bullet`, Prefab).then((prefab: Prefab) => {
                const bullet = instantiate(prefab);
                resolve(bullet);
            })
        });
    }
}