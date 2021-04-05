import Discord from 'discord.js';
import Command from '../../Command';
import DatabaseType from '../../DatabaseTypes';
import * as Utils from '../../Utils';

class RanksC extends Command{
    constructor(){
        super();
        this.description="Show Ranks";
        this.category=Command.RankCategory;
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const Ranks=bot.getDatabase(DatabaseType.Ranks);
        let ranks=await Ranks.get(message.guild.id);
        if(!ranks){
            return message.channel.send("This guild does not contain any ranks");
        }
        const embed=new Discord.MessageEmbed();
        const data=[];
        const tempData=[];
        await Utils.asyncForEach(ranks, async(element)=>{
            tempData.push({"level":element["level"], "text": `**Level ${element["level"]}:** ${await Utils.getRoleByID(element["role"], message.guild)||"Deleted Role"}`});
        });
        await tempData.sort((a, b)=>a["level"]-b["level"]);
        tempData.forEach(element=>{
            data.push(element["text"]);
        });
        embed.setDescription(data);
        const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
        if(botMember.roles&&botMember.roles.color)
            embed.setColor(botMember.roles.color.color);
        return message.channel.send(embed);
    }
}

module.exports=RanksC;