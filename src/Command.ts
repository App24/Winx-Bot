import BotClient from "./BotClient";
import Discord from 'discord.js';

const CAT_SETTINGS="Settings";
const CAT_OWNER="Owner";
const CAT_TINGZ="Characters";
const CAT_RANK="Rankings";
const CAT_INFO="Info";
const CAT_CUSTOM="Customisation";
const CAT_PATREON="Patreon";

abstract class Command{

    public guildOnly : boolean;
    public minArgsLength : number;
    public maxArgsLength : number;
    public paid : boolean;
    public description : string;
    public usage : string;
    public permissions : Array<string>;
    public deprecated : boolean;
    public cooldown : number;
    public creatorOnly : boolean;
    public guildOwnerOnly : boolean;
    public hidden : true;
    public aliases : Array<string>;
    public category : string;

    public constructor(){
        this.minArgsLength=0;
        this.maxArgsLength=Number.MAX_SAFE_INTEGER;
        this.guildOnly=true;
        this.category="Other";
    }

    protected printTLArgsError(message : Discord.Message, num : number){
        message.reply(`You need ${num} arguments!`);
    }

    public abstract onRun(bot : BotClient, message : Discord.Message, args:Array<string>);

    public static get SettingsCategory(){
        return CAT_SETTINGS;
    }

    public static get OwnerCategory(){
        return CAT_OWNER;
    }

    public static get TingzCategory(){
        return CAT_TINGZ;
    }

    public static get RankCategory(){
        return CAT_RANK;
    }

    public static get InfoCategory(){
        return CAT_INFO;
    }

    public static get CustomisationCategory(){
        return CAT_CUSTOM;
    }

    public static get PatreonCategory(){
        return CAT_PATREON;
    }
}

export = Command;