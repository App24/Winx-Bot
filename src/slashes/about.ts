import Discord from 'discord.js';
import * as Utils from '../Utils';
import {VERSION} from '../Constants';

module.exports={
    data: {
        guildOnly: false
    }
}

module.exports.onRun=async (client:import("../BotClient"), interaction, args : string[])=>{
    const embed=new Discord.MessageEmbed();
    const data=[];
    const creators=process.env.CREATORS.replace(" ", "").split(",");
    await Utils.asyncForEach(creators, async(creator)=>{
        const user=await Utils.getUserByID(creator, client);
        if(user) data.push(user);
    });
    const botMember=await Utils.getMemberByID(client.user.id, client.guilds.resolve(interaction.guild_id));
    embed.setTimestamp();
    embed.setAuthor((botMember&&botMember.nickname)||client.user.username, client.user.avatarURL());
    embed.addField("About", "This bot was created by and for Winx fans, it allows for users to level up and earn new transformations, it is entirely customisable from transformation names to when you get each!");
    embed.addField("Creators", data.join(", "));
    embed.addField("Version", VERSION);
    if(botMember&&botMember.roles&&botMember.roles.color)
    embed.setColor(botMember.roles.color.color);

    Utils.reply(client, interaction, embed);
}