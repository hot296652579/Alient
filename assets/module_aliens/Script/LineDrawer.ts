import {
    _decorator,
    Component,
    Vec3,
    Color,
    MeshRenderer,
    Material,
    Mesh,
    utils,
    gfx,
    director
} from 'cc';

const { ccclass } = _decorator;

@ccclass('LineDrawer')
export class LineDrawer extends Component {
    private _meshRenderer: MeshRenderer | null = null;

    onLoad() {
        this._meshRenderer = this.getComponent(MeshRenderer) || this.node.addComponent(MeshRenderer);
        
        // 使用 unlit 材质
        const mat = new Material();
        mat.initialize({ effectName: 'unlit' });
        this._meshRenderer.material = mat;
    }

    public drawLine(start: Vec3, end: Vec3, color: Color = Color.RED) {
        if (!this._meshRenderer) return;

        // 创建顶点数据
        const positions = [start.x, start.y, start.z, end.x, end.y, end.z];
        const colors = [color.r, color.g, color.b, color.a, color.r, color.g, color.b, color.a];
        
        // 创建Mesh
        const mesh = new Mesh();
        utils.createMesh({
            positions: positions,
            colors: colors,
            primitiveMode: gfx.PrimitiveMode.LINE_LIST
        }, mesh);

        // 设置Mesh
        this._meshRenderer.mesh = mesh;
    }

    public clear() {
        if (this._meshRenderer) {
            this._meshRenderer.mesh = null;
        }
    }
}