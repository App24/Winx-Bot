const Command=require("../../Command");
const Utils=require("../../Utils");
const Discord=require("discord.js");

const command=new Command("rank");
command.description="Shows your position on the leaderboard compared to other people on the server";
command.run=async(bot, message, args)=>{
    const Levels=bot.tables["levels"];
    const levels=await Levels.get(message.guild.id);
        let _user=message.author;
        if(args.length>0){
            const temp=await Utils.getUserFromMention(args[0], bot);
            if(temp) _user=temp;
        }
        if(!levels) return message.channel.send("There are no levels in this server");
        const actualLevels=[];
        await Utils.asyncForEach(levels, async(element)=>{
            const user=await Utils.getUserFromMention(element["id"], bot);
            if(user) actualLevels.push(element);
        });
        await actualLevels.sort((a,b)=>{
            if(a["level"]===b["level"]){
                return (a["xp"]>b["xp"])?-1:1;
            }
            return (a["level"]>b["level"])?-1:1;
        });
        const embed=new Discord.MessageEmbed();
        const shortLevels=actualLevels.slice(0,15);
        const data=[];
        let i=1;
        await Utils.asyncForEach(shortLevels, async(element)=>{
            const user=await Utils.getUserFromMention(element["id"], bot);
            if(!user) return;
            const member=await Utils.getMemberById(user.id, message.guild);
            if(!member) return;
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
            data.push(`Level: ${element["level"]} XP: ${element["xp"]}/${Utils.getXPLevel(element["level"])}`);
            i++;
        });
        const index=shortLevels.findIndex((user)=>user["id"]===_user.id);
        if(index<0){
            const userInfo=levels.find((user)=>user["id"]===_user.id);
            if(userInfo){
                data.push("...");
                const userIndex=levels.findIndex((user)=>user["id"]===_user.id);
                const member=await Utils.getUserById(_user.id, bot);
                data.push(`${userIndex+1}. __**${member.nickname||_user.username}**__`);
                data.push(`Level: ${userInfo["level"]} XP: ${userInfo["xp"]}/${Utils.getXPLevel(userInfo["level"])}`);

            }else{
                await message.channel.send(`\`${_user.username}\` does not have any levels!`);
            }
        }
        embed.setDescription(data);
        message.channel.send(embed);
}

module.exports=command;