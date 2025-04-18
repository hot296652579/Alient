import { tgxModuleContext, tgxUIController } from "../core_tgx/tgx";
import { ModuleDef } from "./ModuleDef";

//define UI classes which are not in the basic bundle but be called by other bundles.

export class UI_AboutMe extends tgxUIController { }
export class UI_Setting extends tgxUIController { }
export class UI_BattleResult extends tgxUIController { }
export class UI_BattleGambit extends tgxUIController { }
export class UI_PowerUp extends tgxUIController { }
export class UI_TimeExpan extends tgxUIController { }
export class UI_TopInfo extends tgxUIController { }
export class UI_ExtraTime extends tgxUIController { }
export class UI_Magnetic extends tgxUIController { }
tgxModuleContext.attachModule(UI_AboutMe, ModuleDef.MODULE_ALIENS);
tgxModuleContext.attachModule(UI_Setting, ModuleDef.MODULE_ALIENS);
tgxModuleContext.attachModule(UI_Magnetic, ModuleDef.MODULE_ALIENS);
tgxModuleContext.attachModule(UI_BattleGambit, ModuleDef.MODULE_ALIENS);
tgxModuleContext.attachModule(UI_PowerUp, ModuleDef.MODULE_ALIENS);
tgxModuleContext.attachModule(UI_TimeExpan, ModuleDef.MODULE_ALIENS);
tgxModuleContext.attachModule(UI_BattleResult, ModuleDef.MODULE_ALIENS);
