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
    var j=0;
    await Utils.asyncForEach(levels, async(element)=>{
        const user=await Utils.getUserById(element["id"], bot);
        if(user){
            actualLevels.push(element);
            j++;
            if(j>=16){
                return true;
            }
        }
    });
    const embed=new Discord.MessageEmbed();
    const data=[];
    let i=1;
    await Utils.asyncForEach(actualLevels, async(element)=>{
        const member=await Utils.getMemberById(element["id"], message.guild);
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
        data.push(`Level: ${element["level"]} XP: ${element["xp"]}/${Utils.getXPLevel(element["level"])}`);
        i++;
    });
    const index=actualLevels.findIndex((user)=>user["id"]===_user.id);
    if(index<0){
        const userInfo=levels.find((user)=>user["id"]===_user.id);
        if(userInfo){
            data.push("...");
            const userIndex=levels.findIndex((user)=>user["id"]===_user.id);
            const member=await Utils.getMemberById(_user.id, message.guild);
            let text="";
            text+=`${userIndex+1}. **__${_user.username}`;
            if(member.nickname)
                text+=` (${member.nickname})`;
            text+=`__**`;
            data.push(text);
            data.push(`Level: ${userInfo["level"]} XP: ${userInfo["xp"]}/${Utils.getXPLevel(userInfo["level"])}`);

        }else{
            await message.channel.send(`\`${_user.username}\` does not have any levels!`);
        }
    }
    embed.setDescription(data);
    message.channel.send(embed);
}

module.exports=command;