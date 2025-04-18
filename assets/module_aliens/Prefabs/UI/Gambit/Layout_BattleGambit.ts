import { _decorator, Button, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout_BattleGambit')
export class Layout_BattleGambit extends Component {
    @property(Button)
    btn_get: Button = null;

    @property(Button)
    btn_back: Button = null;
}


