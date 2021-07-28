import { Message, NewsChannel, TextChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Command, CommandArguments, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, getLevelXP } from "../../Utils";
import { addXP } from "../../XPUtils";


class GiveXPCommand extends Command{
    constructor(){
        super();
        this.cooldown=60*5;
        this.availability=CommandAvailability.Guild;
    }

    public async onRun(cmdArgs : CommandArguments){
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const levels:UserLevel[]=await getServerDatabase(Levels, cmdArgs.guild.id);
        let userLevel = levels.find(u=>u.userId===cmdArgs.author.id);
        if(!userLevel){
            await levels.push(new UserLevel(cmdArgs.author.id));
            userLevel = levels.find(u=>u.userId===cmdArgs.author.id);
        }
        const level=Math.max(1, Math.abs(userLevel.level));
        const per=Math.pow(level, -1.75)*100;
        const rand=Math.random()*100;
        if(rand<=per){
            const xp=Math.floor(getLevelXP(userLevel.level)*0.1);
            await addXP(cmdArgs.author, cmdArgs.guild, <NewsChannel|TextChannel>cmdArgs.channel, xp);
            return cmdArgs.channel.send(Localisation.getTranslation("givexp.success.output", xp));
        }
        cmdArgs.channel.send(Localisation.getTranslation("givexp.fail.output"));
    }
}

export=GiveXPCommand;