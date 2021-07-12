import { Message, NewsChannel, TextChannel } from "discord.js";
import { BotUser } from "../BotClient";
import { Command, CommandAvailability } from "../structs/Command";
import { DatabaseType } from "../structs/DatabaseTypes";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { getLevelXP, getServerDatabase } from "../Utils";
import { addXP } from "../XPUtils";

class GiveXPCommand extends Command{
    constructor(){
        super("Gives you free xp");
        this.cooldown=60*5;
        this.availability=CommandAvailability.Guild;
    }

    public async onRun(message : Message, args : string[]){
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const levels:UserLevel[]=await getServerDatabase(Levels, message.guild.id);
        let userLevel = levels.find(u=>u.userId===message.author.id);
        if(!userLevel){
            await levels.push(new UserLevel(message.author.id));
            userLevel = levels.find(u=>u.userId===message.author.id);
        }
        const level=Math.max(1, Math.abs(userLevel.level));
        const per=Math.pow(level, -1.75)*100;
        const rand=Math.random()*100;
        if(rand<=per){
            const xp=Math.floor(getLevelXP(userLevel.level)*0.1);
            await addXP(message.author, message.guild, <NewsChannel|TextChannel>message.channel, xp);
            return message.channel.send(`You have earned ${xp} XP!`);
        }
        message.channel.send("As Iffffff i'm gonna give out free xp");
    }
}

export=GiveXPCommand;