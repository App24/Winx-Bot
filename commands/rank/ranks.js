const Command=require("../../Command");
const Discord=require('discord.js');
const Utils = require('../../Utils');

class RanksC extends Command{
    constructor(){
        super("ranks");
        this.description="Show Ranks";
        this.category=Command.RankCategory;
    }

    async onRun(bot, message, args){
        const Ranks=bot.tables["ranks"];
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