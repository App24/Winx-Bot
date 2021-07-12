export class UserSetting{
    public userId : string;
    public barStartColor : string="";
    public barEndColor : string="";
    public cardColor : string="";
    public nameColor : string="";
    public specialCircleColor : string="";
}

export function copyUserSetting(userSetting : UserSetting, userId : string){
    const newUserSettings=new UserSetting();
    newUserSettings.userId=userId;
    newUserSettings.barStartColor=userSetting.barStartColor;
    newUserSettings.barEndColor=userSetting.barEndColor;
    newUserSettings.cardColor=userSetting.cardColor;
    newUserSettings.nameColor=userSetting.nameColor;
    newUserSettings.specialCircleColor=userSetting.specialCircleColor;
    return newUserSettings;
}

const DEFAULT_USER_SETTING=new UserSetting();
DEFAULT_USER_SETTING.cardColor="363636";
DEFAULT_USER_SETTING.barStartColor="cc0000";
DEFAULT_USER_SETTING.barEndColor="44cc00";
DEFAULT_USER_SETTING.nameColor="none";
DEFAULT_USER_SETTING.specialCircleColor="ffffff";

export{DEFAULT_USER_SETTING};