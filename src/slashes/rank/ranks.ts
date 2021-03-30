import Discord from 'discord.js';
import * as Utils from '../../Utils';

module.exports={
    data: {
        guildOnly: true
    }
}

module.exports.onRun=async (client:import("../../BotClient"), interaction, args : string[])=>{

    await (<any>client).api.interactions(interaction.id, interaction.token).callback.post({
        data:{
            type:5
        }
    });

    const Ranks=client.getDatabase("ranks");
    const channel=<Discord.GuildChannel>client.channels.resolve(interaction.channel_id);
    let ranks=await Ranks.get(interaction.guild_id);
    if(!ranks){
        return (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
            data:{
                content: "This guild does not contain any ranks"
            }
        });
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

    const data=<any>await Utils.createAPIMessage(client, interaction, embed);

    (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
        data
    });
};