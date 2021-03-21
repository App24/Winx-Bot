import Discord from 'discord.js';
import Command from '../../Command';
import * as Utils from '../../Utils';

class Rank extends Command{
    constructor(){
        super();
        this.description="Shows your position on the leaderboard compared to other people on the server";
        this.category=Command.RankCategory;
        this.usage="[user]";
        this.maxArgsLength=1;
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const Levels=bot.getDatabase("levels");
        const levels=await Levels.get(message.guild.id);
        let _user=message.author;
        if(args.length>0){
            const temp=await Utils.getUserFromMention(args[0], bot);
            if(!temp) return message.channel.send(`\`${args[0]}\` is not a valid user`);
            if(temp) _user=temp;
        }
        if(!levels) return message.channel.send("There are no levels in this server");
        await levels.sort((a,b)=>{
            if(a["level"]===b["level"]){
                return (a["xp"]>b["xp"])?-1:1;
            }
            return (a["level"]>b["level"])?-1:1;
        });
        const actualLevels=[];
        var _userIndex=0;
        await Utils.asyncForEach(levels, async(element)=>{
            const user=await Utils.getUserByID(element["id"], bot);
            if(user){
                actualLevels.push(element);
                _userIndex++;
                if(_userIndex>=16){
                    return true;
                }
            }
        });
        const data=[];
        let i=1;
        await Utils.asyncForEach(actualLevels, async(element)=>{
            const member=await Utils.getMemberByID(element["id"], message.guild);
            if(!member) return;
            const user=member.user;
            if(user.id===_user.id){
                let text="";
                text+=`${i}. __**${user.username}`;
                if(member.nickname)
                    text+=` (${member.nickname})`;
                text+=`**__`;
                data.push(text);
            }
            else{
                let text="";
                text+=`${i}. **${user.username}`;
                if(member.nickname)
                    text+=` (${member.nickname})`;
                text+=`**`;
                data.push(text);
            }
            data.push(`Level: ${element["level"]} XP: ${element["xp"]}/${Utils.getLevelXP(element["level"])}`);
            i++;
        });
        const index=actualLevels.findIndex((user)=>user["id"]===_user.id);
        if(index<0){
            const userInfo=levels.find((user)=>user["id"]===_user.id);
            if(userInfo){
                data.push("...");
                const userIndex=levels.findIndex((user)=>user["id"]===_user.id);
                const member=await Utils.getMemberByID(_user.id, message.guild);
                if(!member) return message.channel.send(`The user ${_user} is not a member of the server!`);
                let text="";
                text+=`${userIndex+1}. **__${_user.username}`;
                if(member.nickname)
                    text+=` (${member.nickname})`;
                text+=`__**`;
                data.push(text);
                data.push(`Level: ${userInfo["level"]} XP: ${userInfo["xp"]}/${Utils.getLevelXP(userInfo["level"])}`);
    
            }else{
                await message.channel.send(`\`${_user.username}\` does not have any levels!`);
            }
        }
        const embed=new Discord.MessageEmbed();
        embed.setDescription(data);
        const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
        if(botMember.roles&&botMember.roles.color)
            embed.setColor(botMember.roles.color.color);
        message.channel.send(embed);
    }
}

module.exports=Rank;