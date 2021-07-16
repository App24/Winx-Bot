import { CommandAccess, CommandAvailability } from "./Command";

export class Category{
    public name : string;
    public emoji : string;
    public availability : CommandAvailability;
    public access : CommandAccess;

    public constructor(name : string, emoji : string, available : CommandAvailability=CommandAvailability.Both, access? : CommandAccess){
        this.name=name;
        this.emoji=emoji;
        this.availability=available;
        this.access=access;
        Categories.push(this);
    }
}

export const Categories:Category[]=[];

export const Owner=new Category("category.owner", "👑", CommandAvailability.Both, CommandAccess.BotOwner);
export const Moderator=new Category("category.moderator", "⚔", CommandAvailability.Guild, CommandAccess.Moderators);
export const Settings=new Category("category.settings", "⚙", CommandAvailability.Guild, CommandAccess.Moderators);
export const Info=new Category("category.info", "❓");
export const Characters=new Category("category.characters", "👨");
export const Rank=new Category("category.ranking", "🔢", CommandAvailability.Guild);
export const Customisation=new Category("category.customisation", "🔧", CommandAvailability.Guild);

export const Other=new Category("category.other", "♻");