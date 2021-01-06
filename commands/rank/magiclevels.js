const Command=require("../../Command");
const Utils=require("../../Utils");

const command=new Command("magiclevels");
command.description="Shows How Far You Are To The Next Level";
command.usage="[user]";
command.run=async(bot, message, args)=>{
    let user=await Utils.getUserFromMention(args[0], bot);
    if(!user) user=message.author;
    if(user) if(user.bot) return message.channel.send(`\`${user.username}\` is a bot, they do no have levels`);
    const Levels=bot.tables["levels"];
    let serverInfo=await Levels.get(message.guild.id);
    if(!serverInfo){
        await Levels.set(message.guild.id, []);
        serverInfo=await Levels.get(message.guild.id);
    }
    let userInfo=await serverInfo.find(u=>u["id"]===user.id);
    if(!userInfo){
        await serverInfo.push({"id":user.id, "xp":0, "level":0});
        userInfo=await serverInfo.find(u=>u["id"]===user.id);
    }
    const member=await Utils.getMemberById(user.id, message.guild);
    if(!member) return message.channel.send(`\`${user.username}\` is not a member of this server!`);
    let text="";
    text+=`\`${user.username}`;
    if(member.nickname)
        text+=` (${member.nickname})`;
    text+=`\`: Level: ${userInfo["level"]} XP: ${userInfo["xp"]}/${Utils.getXPLevel(userInfo["level"])}`;
    message.channel.send(text);
}

module.exports=command;