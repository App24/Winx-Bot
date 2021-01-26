const Command=require("../../Command");
const Utils=require("../../Utils");
const Discord=require("discord.js");

const command=new Command("checkbans");
command.permissions=["MANAGE_GUILD"];
command.hidden=true;
command.run=async(bot, message, args)=>{
    var bans=await message.guild.fetchBans();
    var bansList=[];
    const Levels=bot.tables["levels"];
    const levels=await Levels.get(message.guild.id);
    if(!levels) return message.channel.send("There are no levels in this server");
    bans.forEach(element => {
        bansList.push(element);
    });
    await Utils.asyncForEach(bansList, async(ban)=>{
        const level=await levels.find((user)=>user.id==ban.user.id);
        if(level)
            delete levels[level];
    });
    await Levels.set(message.guild.id, levels);
    message.channel.send("Deleted all banned users from the levels!");
};

module.exports=command;