import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { getMemberFromMention } from "../../GetterUtilts";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getLevelXP, getServerDatabase } from "../../Utils";

class SetLevelCommand extends Command{
    public constructor(){
        super("Sets level for user");
        this.category=Owner;
        this.access=CommandAccess.BotOwner;
        this.availability=CommandAvailability.Guild;
        this.usage="<user> <level> [xp]";
        this.minArgs=2;
        this.maxArgs=3;
    }

    public async onRun(message : Message, args : string[]){
        const member=await getMemberFromMention(args[0], message.guild);
        if(!member) return message.reply("That is not a member of this server!");
        const level=parseInt(args[1]);
        if(isNaN(level)||level<0) return message.reply("That is not a valid level!");
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const levels:UserLevel[]=await getServerDatabase(Levels, message.guild.id);
        let userLevel=levels.find(user=>user.userId===member.id);
        if(!userLevel){
            levels.push(new UserLevel(member.id));
            userLevel=levels.find(user=>user.userId===member.id);
        }
        const index=levels.indexOf(userLevel);
        let xp=Math.round((userLevel.xp/getLevelXP(userLevel.level))*getLevelXP(level));
        if(args[2]){
            xp=parseInt(args[2]);
            if(isNaN(xp)||xp<0||xp>=getLevelXP(level)) return message.reply("That is not a valid amount of xp!");
        }
        userLevel.level=level;
        userLevel.xp=xp;
        levels[index]=userLevel;
        await Levels.set(message.guild.id, levels);
        message.channel.send(`Set the level of ${member} to ${level} and xp to ${xp}`);
    }
}

export=SetLevelCommand;