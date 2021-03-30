import Discord from 'discord.js';
import Command from '../Command';
import * as Utils from '../Utils';

class GiveXP extends Command{
    constructor(){
        super();
        this.description="Gives you free xp";
        this.cooldown=60*5;
    }

    public async onRun(bot : import("../BotClient"), message : Discord.Message, args: string[]){
        const Levels=bot.getDatabase("levels");
        const levels=await Utils.getServerDatabase(Levels, message.guild.id);
        let userInfo=await levels.find(u=>u["id"]===message.author.id);
        if(!userInfo){
            await levels.push({"id":message.author.id, "xp":0, "level":0});
            userInfo=await levels.find(u=>u["id"]===message.author.id);
        }
        const level=Math.max(1, Math.abs(userInfo.level));
        const per=Math.pow(level, -1.75)*100;
        const rand=Math.random()*100;
        if(rand<=per){
            // const ServerInfo=bot.getDatabase("serverInfo");
            // const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {"xpPerMessage": 5, "messagesPerMinute": 50});
            // if(!serverInfo["xpPerMessage"]){
            //     serverInfo["xpPerMessage"]=5;
            //     await ServerInfo.set(message.guild.id, serverInfo);
            // }
            // const maxMessageXp=10;
            // const xp=Math.ceil(Math.random()*maxMessageXp)*serverInfo["xpPerMessage"];
            const xp=Math.floor(Utils.getLevelXP(userInfo["level"])*0.1);
            Utils.addXP(bot, message.author, xp, message.guild, message.channel);
            return message.channel.send(`You have earned ${xp} XP!`);
        }
        message.channel.send("As Iffffff i'm gonna give out free xp");
    }
}

module.exports=GiveXP;
