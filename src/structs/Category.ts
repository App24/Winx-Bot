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

export const Owner=         new Category("Owner",           ":crown:",              CommandAvailability.Both, CommandAccess.BotOwner);
export const Moderator=     new Category("Moderator",       ":crossed_swords:",     CommandAvailability.Guild, CommandAccess.Moderators);
export const Settings=      new Category("Settings",        ":gear:",               CommandAvailability.Guild, CommandAccess.Moderators);
export const Info=          new Category("Info",            ":question:");
export const Characters=    new Category("Characters",      ":person_curly_hair:");
export const Rank=          new Category("Ranking",         ":1234:",               CommandAvailability.Guild);
export const Customisation= new Category("Customisation",   ":wrench:",             CommandAvailability.Guild);

export const Other=new Category("Other", ":recycle:");