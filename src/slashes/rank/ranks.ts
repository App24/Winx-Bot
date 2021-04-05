import Discord from 'discord.js';
import DatabaseType from '../../DatabaseTypes';
import * as Utils from '../../Utils';

module.exports={
    data: {
        guildOnly: true
    }
}

module.exports.onRun=async (client:import("../../BotClient"), interaction, args : string[])=>{
    const Ranks=client.getDatabase(DatabaseType.Ranks);
    const channel=<Discord.GuildChannel>client.channels.resolve(interaction.channel_id);
    let ranks=await Ranks.get(interaction.guild_id);
    if(!ranks){
        return Utils.reply(client, interaction, "This guild does not contain any ranks");
    }
    const embed=new Discord.MessageEmbed();
    const _data=[];
    const tempData=[];
    await Utils.asyncForEach(ranks, async(element)=>{
        tempData.push({"level":element["level"], "text": `**Level ${element["level"]}:** ${await Utils.getRoleByID(element["role"], channel.guild)||"Deleted Role"}`});
    });
    await tempData.sort((a, b)=>a["level"]-b["level"]);
    tempData.forEach(element=>{
        _data.push(element["text"]);
    });
    embed.setDescription(_data);
    const botMember=await Utils.getMemberByID(client.user.id, channel.guild);
    if(botMember.roles&&botMember.roles.color)
        embed.setColor(botMember.roles.color.color);

    Utils.reply(client, interaction, embed);
};