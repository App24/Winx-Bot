import Discord from 'discord.js';
import Command from '../../Command';
import DatabaseType from '../../DatabaseTypes';
import * as Utils from '../../Utils';

class CheckBans extends Command{
    constructor(){
        super();
        this.permissions=["MANAGE_GUILD"];
        this.category=Command.RankCategory;
        this.description="Check bans";
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const bans=await message.guild.fetchBans();
        var bansList=[];
        const Levels=bot.getDatabase(DatabaseType.Levels);
        const levels:any[]=await Levels.get(message.guild.id);
        if(!levels) return message.channel.send("There are no levels in this server");
        bans.forEach(element => {
            bansList.push(element);
        });
        await Utils.asyncForEach(bansList, async(ban)=>{
            const level=await levels.findIndex((user)=>user["id"]===ban.user.id);
            if(level>-1)
                levels.splice(level, 1);
        });
        await Levels.set(message.guild.id, levels);
        message.channel.send("Deleted all banned users from the levels!");
    }
}

module.exports=CheckBans;