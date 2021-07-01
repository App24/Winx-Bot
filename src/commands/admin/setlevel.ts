import Discord from 'discord.js';
import { Owner } from '../../Category';
import Command from '../../Command';
import DatabaseType from '../../DatabaseTypes';
import * as Utils from '../../Utils';

class SetLevel extends Command{
    constructor(){
        super();
        this.creatorOnly=true;
        this.maxArgsLength=3;
        this.minArgsLength=2;
        this.usage="<user> <level> [xp]";
        this.category=Owner;
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const member=await Utils.getMemberByID(args[0], message.guild);
        let level=parseInt(args[1]);
        if(!member) return message.reply("That is not a member of the server!");
        if(isNaN(level)||level<0) return message.reply("That is not a valid level");
        const Levels=bot.getDatabase(DatabaseType.Levels);
        const levels=await Utils.getServerDatabase(Levels, message.guild.id);
        let userInfo : object=await levels.find(u=>u["id"]===member.id);
        if(!userInfo){
            await levels.push({"id":member.id, "xp":0, "level":0});
            userInfo=await levels.find(u=>u["id"]===member.id);
        }
        const index=levels.indexOf(userInfo);
        let xpRation=userInfo["xp"]/Utils.getLevelXP(userInfo["level"]);
        let xp=Math.round(xpRation*Utils.getLevelXP(level));
        if(args[2]){
            xp=parseInt(args[2]);
            if(isNaN(xp)||xp<0||xp>=Utils.getLevelXP(level)) return message.reply("That is not a valid amount of xp!")
        }
        userInfo["level"]=level;
        userInfo["xp"]=xp;
        levels[index]=userInfo;
        await Levels.set(message.guild.id, levels);
        message.channel.send(`Set the level of ${member} to ${level} and xp to ${xp}`);
    }

}

module.exports=SetLevel;