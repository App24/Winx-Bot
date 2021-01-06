const Command=require("../../Command");

const command=new Command("setxp");
command.hidden=true;
command.usage="[amount above 0]";
command.permissions=["MANAGE_GUILD"];
command.run=async(bot, message, args)=>{
    const ServerInfo=bot.tables["serverInfo"];
    let serverInfo=await ServerInfo.get(message.guild.id);
    if(!serverInfo){
        await ServerInfo.set(message.guild.id, {"xpPerMessage": 5, "messagesPerMinute": 50});
        serverInfo=await ServerInfo.get(message.guild.id);
    }
    if(args.length){
        const xp=parseInt(args[0]);
        if(isNaN(xp)||xp<=0) return message.reply(`\`${args[0]}\` does not seem to be a valid number!`);
        serverInfo["xpPerMessage"]=xp;
        await ServerInfo.set(message.guild.id, serverInfo);
        return message.channel.send(`XP per message is now \`${xp}\``);
    }

    return message.channel.send(`The XP per message is \`${serverInfo["xpPerMessage"]}\``);

};

module.exports=command;