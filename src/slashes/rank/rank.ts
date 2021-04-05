import Discord from 'discord.js';
import DatabaseType from '../../DatabaseTypes';
import * as Utils from '../../Utils';

module.exports={
    data: {
        guildOnly: true
    }
}

module.exports.onRun=async (client:import("../../BotClient"), interaction, args : string[])=>{
    const Levels=client.getDatabase(DatabaseType.Levels);
    const levels=await Levels.get(interaction.guild_id);
    const channel=<Discord.GuildChannel>client.channels.resolve(interaction.channel_id);
    let _user=await Utils.getUserByID(interaction.member.user.id, client);
    if(args.length>0){
        const temp=await Utils.getUserFromMention(args[0], client);
        if(!temp){
            return Utils.reply(client, interaction, `\`${args[0]}\` is not a valid user!`);
        }
        if(temp) _user=temp;
    }
    if(!levels)
        return Utils.reply(client, interaction, `There are no levels in this server!`);
    await levels.sort((a,b)=>{
        if(a["level"]===b["level"]){
            return (a["xp"]>b["xp"])?-1:1;
        }
        return (a["level"]>b["level"])?-1:1;
    });
    const actualLevels=[];
    var _userIndex=0;
    await Utils.asyncForEach(levels, async(element)=>{
        const user=await Utils.getMemberByID(element["id"], channel.guild);
        if(user){
            actualLevels.push(element);
            _userIndex++;
            if(_userIndex>=15){
                return true;
            }
        }
    });
    const _data=[];
    let i=1;
    await Utils.asyncForEach(actualLevels, async(element)=>{
        const member=await Utils.getMemberByID(element["id"], channel.guild);
        if(!member) return;
        const user=member.user;
        if(user.id===_user.id){
            let text="";
            text+=`${i}. __**${user.username}`;
            if(member.nickname)
                text+=` (${member.nickname})`;
            text+=`**__`;
            _data.push(text);
        }
        else{
            let text="";
            text+=`${i}. **${user.username}`;
            if(member.nickname)
                text+=` (${member.nickname})`;
            text+=`**`;
            _data.push(text);
        }
        _data.push(`Level: ${element["level"]} XP: ${element["xp"]}/${Utils.getLevelXP(element["level"])}`);
        i++;
    });
    const index=actualLevels.findIndex((user)=>user["id"]===_user.id);
    if(index<0){
        const userInfo=levels.find((user)=>user["id"]===_user.id);
        if(userInfo){
            _data.push("...");
            const userIndex=levels.findIndex((user)=>user["id"]===_user.id);
            const member=await Utils.getMemberByID(_user.id, channel.guild);
            if(!member)
                return Utils.reply(client, interaction, `The user ${_user} is not a member of this server!`);
            let text="";
            text+=`${userIndex+1}. **__${_user.username}`;
            if(member.nickname)
                text+=` (${member.nickname})`;
            text+=`__**`;
            _data.push(text);
            _data.push(`Level: ${userInfo["level"]} XP: ${userInfo["xp"]}/${Utils.getLevelXP(userInfo["level"])}`);

        }else{
            return Utils.reply(client, interaction, `\`${_user.username}\` does not have any levels!`);
        }
    }
    const embed=new Discord.MessageEmbed();
    embed.setDescription(_data);
    const botMember=await Utils.getMemberByID(client.user.id, channel.guild);
    if(botMember.roles&&botMember.roles.color)
        embed.setColor(botMember.roles.color.color);

    Utils.reply(client, interaction, embed);
}