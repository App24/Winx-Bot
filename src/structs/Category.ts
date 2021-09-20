import { CommandAvailable, CommandAccess } from "./Command";

export class Category{
    public name : string;
    public emoji : string;
    public getNames:string[];
    public availability : CommandAvailable;
    public access : CommandAccess;

    public constructor(name : string, emoji : string, getNames:string[], available : CommandAvailable=CommandAvailable.Both, access? : CommandAccess){
        this.name=name;
        this.getNames=getNames;
        this.emoji=emoji;
        this.availability=available;
        this.access=access;
        Categories.push(this);
    }
}

export const Categories:Category[]=[];

export const Owner=new Category("category.owner", "👑", ["owner"], CommandAvailable.Both, CommandAccess.BotOwner);
export const Moderator=new Category("category.moderator", "⚔", ["moderator", "moderators"], CommandAvailable.Guild, CommandAccess.Moderators);
export const Settings=new Category("category.settings", "⚙", ["setting", "settings"], CommandAvailable.Guild, CommandAccess.Moderators);
export const CustomCommandsSettings=new Category("category.customcommandsettings", "🛠", ["customcommandsettings", "command settings", "custom command settings"], CommandAvailable.Guild, CommandAccess.Moderators);
export const Info=new Category("category.info", "❓", ["info", "information"]);
export const Characters=new Category("category.characters", "👨", ["chars", "characters"]);
export const Rank=new Category("category.ranking", "🔢", ["rank", "ranking", "rankings"], CommandAvailable.Guild);
export const Customisation=new Category("category.customisation", "🔧", ["custom", "customisation", "customization"], CommandAvailable.Guild);
export const CustomCommands=new Category("category.customcommands", "✏", ["customcommands", "commands", "custom commands"], CommandAvailable.Guild, CommandAccess.None);
export const Minigames=new Category("category.minigames", "🎯", ["minigame", "minigames"]);

export const Other=new Category("category.other", "♻", ["other"]);