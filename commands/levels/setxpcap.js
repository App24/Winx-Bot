const Command=require("../../Command");
const Utils=require("../../Utils");

class SetXPCap extends Command{
    constructor(){
        super("setxpcap");
        this.modOnly=true;
        this.usage="[amount above 0]";
        this.category=Command.SettingsCategory;
        this.description="Set max messages per minute";
    }

    async onRun(bot, message, args){
        const ServerInfo=bot.tables["serverInfo"];
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {"xpPerMessage": 5, "messagesPerMinute": 50});
        if(args.length){
            const xp=parseInt(args[0]);
            if(isNaN(xp)||xp<=0) return message.reply(`\`${args[0]}\` does not seem to be a valid number!`);
            serverInfo["messagesPerMinute"]=xp;
            await ServerInfo.set(message.guild.id, serverInfo);
            return message.channel.send(`Max messages per minute is now \`${xp}\``);
        }
    
        return message.channel.send(`The max messages per minute is \`${serverInfo["messagesPerMinute"]}\``);
    }
}

module.exports=SetXPCap;