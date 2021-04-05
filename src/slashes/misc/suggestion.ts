import Discord from 'discord.js';
import DatabaseType from '../../DatabaseTypes';
import * as Utils from '../../Utils';

module.exports={
    data:{
        guildOnly: false
    }
}

module.exports.onRun=async (client:import("../../BotClient"), interaction, args : string[])=>{
    const promises = [
        client.shard.broadcastEval(`this.channels.fetch('${process.env.SUGGESTION_CHANNEL}').catch(console.error);`),
    ];

    Promise.all(promises).then(async(results)=>{
        const channeld=results[0].reduce((acc,curr)=>{if(curr!==undefined) acc=curr;});
        const channel=new Discord.TextChannel(new Discord.Guild(client, {id:channeld["guild"]}), {id:channeld["id"]});
        const botMember=await Utils.getMemberByID(client.user.id, client.guilds.resolve(interaction.guild_id));
        const user=await Utils.getUserByID((interaction.user&&interaction.user.id)||interaction.member.user.id, client);
        if(!user) return;
        const request=args.join(" ");
        const text=`**Request by ${user}**\n${request}`;
        const embed=new Discord.MessageEmbed()
        .setDescription(text)
        .setTimestamp()
        .setFooter(user.tag, user.displayAvatarURL());
        if(botMember&&botMember.roles&&botMember.roles.color)
        embed.setColor(botMember.roles.color.color);
        channel.send(embed).then(async(msg)=>{
            msg.react('✅');
            msg.react('❌');
            const collector=msg.createReactionCollector((reaction, _user)=>(['✅', "❌"].includes(reaction.emoji.name) && _user.id===process.env.OWNER_ID), {max: 1});

            collector.once("end", ()=>{
                msg.reactions.removeAll();
            });

            await collector.on("collect", async(reaction)=>{
                if(reaction.emoji.name==="✅"){
                    const embed2=msg.embeds[0];
                    embed2.setTitle("Accepted");
                    msg.edit(embed2);
                    const Suggestions=client.getDatabase(DatabaseType.Suggestions);
                    let hex=Utils.genRanHex(16);
                    let suggestions=await Suggestions.get(hex);
                    while(suggestions){
                        hex=Utils.genRanHex(16);
                        suggestions=await Suggestions.get(hex);
                    }
                    const data={"requestor":user.id, "request":request, "state":"non"};
                    await Suggestions.set(hex, data);
                }else if(reaction.emoji.name==='❌'){
                    const embed2=msg.embeds[0];
                    embed2.setTitle("Rejected");
                    msg.edit(embed2);
                }
            });

        });

        Utils.reply(client, interaction, "Suggestion sent!");
    });
}