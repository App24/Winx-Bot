import Discord from 'discord.js';
import * as Utils from '../Utils';

module.exports={
    data: {
        guildOnly: true,
        cooldown: 5*60
    }
}

module.exports.onRun=async (client:import("../BotClient"), interaction, args : string[])=>{
    await (<any>client).api.interactions(interaction.id, interaction.token).callback.post({
        data:{
            type:5
        }
    });
    const Levels=client.getDatabase("levels");
    const guild=client.guilds.resolve(interaction.guild_id);
    const channel=await Utils.getTextChannelByID(interaction.channel_id, guild);
    const user=await Utils.getUserByID(interaction.member.user.id, client);
    const levels=await Utils.getServerDatabase(Levels, guild.id);
    let userInfo=await levels.find(u=>u["id"]===user.id);
    if(!userInfo){
        await levels.push({"id":interaction.member.user.id, "xp":0, "level":0});
        userInfo=await levels.find(u=>u["id"]===user.id);
    }
    const level=Math.max(1, Math.abs(userInfo.level));
    const per=Math.pow(level, -1.75)*100;
    const rand=Math.random()*100;
    if(rand<=per){
        // const ServerInfo=bot.getDatabase("serverInfo");
        // const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {"xpPerMessage": 5, "messagesPerMinute": 50});
        // if(!serverInfo["xpPerMessage"]){
        //     serverInfo["xpPerMessage"]=5;
        //     await ServerInfo.set(message.guild.id, serverInfo);
        // }
        // const maxMessageXp=10;
        // const xp=Math.ceil(Math.random()*maxMessageXp)*serverInfo["xpPerMessage"];
        const xp=Math.floor(Utils.getLevelXP(userInfo["level"])*0.1);
        Utils.addXP(client, user, xp, guild, channel);
        return (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
            data:{
                content: `You have earned ${xp} XP!`
            }
        });
    }
    (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
        data:{
            content: "As Iffffff i'm gonna give out free xp"
        }
    });
}