import { WinxCharacter } from "../WinxCharacters";

export class UserSetting {
    public barStartColor: string;
    public barEndColor: string;
    public cardColor: string;
    public nameColor: string;
    public specialCircleColor: string;
    public winxCharacter: WinxCharacter;
}

const DEFAULT_USER_SETTING = new UserSetting();
DEFAULT_USER_SETTING.cardColor = "363636";
DEFAULT_USER_SETTING.barStartColor = "cc0000";
DEFAULT_USER_SETTING.barEndColor = "44cc00";
DEFAULT_USER_SETTING.nameColor = "none";
DEFAULT_USER_SETTING.specialCircleColor = undefined;
DEFAULT_USER_SETTING.winxCharacter = WinxCharacter.None;

export { DEFAULT_USER_SETTING };