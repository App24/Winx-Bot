const Command=require("../../Command");
const Utils=require("../../Utils");

class SetXP extends Command{
    constructor(){
        super("setxp");
        this.usage="[amount above 0]";
        this.modOnly=true;
        this.category=Command.SettingsCategory;
        this.description="Set XP per message";
    }

    async onRun(bot, message, args){
        const ServerInfo=bot.tables["serverInfo"];
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {"xpPerMessage": 5, "messagesPerMinute": 50});
        if(args.length){
            const xp=parseInt(args[0]);
            if(isNaN(xp)||xp<=0) return message.reply(`\`${args[0]}\` does not seem to be a valid number!`);
            serverInfo["xpPerMessage"]=xp;
            await ServerInfo.set(message.guild.id, serverInfo);
            return message.channel.send(`XP per message is now \`${xp}\``);
        }
    
        return message.channel.send(`The XP per message is \`${serverInfo["xpPerMessage"]}\``);
    }
}

module.exports=SetXP;