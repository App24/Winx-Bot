import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { Moderator } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase } from "../../Utils";

class CheckBansCommand extends Command{
    public constructor(){
        super("Check bans");
        this.category=Moderator;
        this.access=CommandAccess.Moderators;
        this.availability=CommandAvailability.Guild;
    }

    public async onRun(message : Message, args : string[]){
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const levels:UserLevel[]=await getServerDatabase(Levels, message.guild.id);
        if(!levels) return message.reply("There are no levels in this server!");
        const bans=await message.guild.fetchBans();
        let amount=0;
        bans.forEach(ban=>{
            const index=levels.findIndex(u=>u.userId===ban.user.id);
            if(index>-1){
                levels.splice(index, 1);
                amount++;
            }
        });
        await Levels.set(message.guild.id, levels);
        message.channel.send(`Deleted ${amount} banned user(s) from levels database!`);
    }
}

export=CheckBansCommand;