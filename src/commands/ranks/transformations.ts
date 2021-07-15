import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getRoleByID } from "../../GetterUtilts";
import { Rank } from "../../structs/Category";
import { Command, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { asyncForEach, getBotRoleColor } from "../../Utils";

class RanksCommand extends Command{
    public constructor(){
        super("Shows the transformations available");
        this.availability=CommandAvailability.Guild;
        this.category=Rank;
        this.aliases=["ranks"];
    }

    public async onRun(message : Message, args : string[]){
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await Ranks.get(message.guild.id);
        if(!ranks) return message.reply("There are no ranks in this server!");
        const data=[];
        ranks.sort((a, b)=>a.level-b.level);
        await asyncForEach(ranks, async(rank:RankLevel)=>{
            const role=await getRoleByID(rank.roleId, message.guild);
            if(role){
                data.push(`Level ${rank.level}: ${role}`);
            }
        });
        const embed=new MessageEmbed();
        embed.setDescription(data);
        embed.setColor((await getBotRoleColor(message.guild)));
        message.channel.send(embed);
    }
}

export=RanksCommand;