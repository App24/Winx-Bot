const Command=require("../../Command");
const Discord=require('discord.js');
const Utils = require('../../Utils');

const command=new Command("ranks");
command.description="Get Ranks";
command.run=async(bot, message, args)=>{
    const Ranks=bot.tables["ranks"];
    let ranks=await Ranks.get(message.guild.id);
    if(!ranks){
        return message.channel.send("This guild does not contain any ranks");
    }
    const embed=new Discord.MessageEmbed();
    const data=[];
    const tempData=[];
    await Utils.asyncForEach(ranks, async(element)=>{
        tempData.push({"level":element["level"], "text": `**Level ${element["level"]}:** ${await Utils.getRoleById(element["role"], message.guild)||"Deleted Role"}`})
    })
    await tempData.sort((a, b)=>a["level"]-b["level"]);
    tempData.forEach(element=>{
        data.push(element["text"]);
    });
    embed.setDescription(data);
    return message.channel.send(embed);
}

module.exports=command;