const Command=require('../Command');
const Utils=require("../Utils");

class GiveXP extends Command{
    constructor(){
        super("givexp");
        this.description="Gives you free xp";
    }

    async onRun(bot, message, args){
        const per=0.1;
        const rand=Math.random()*100;
        if(rand<=per){
            const ServerInfo=bot.tables["serverInfo"];
            const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {"xpPerMessage": 5, "messagesPerMinute": 50});
            if(!serverInfo["xpPerMessage"]){
                serverInfo["xpPerMessage"]=5;
                await ServerInfo.set(message.guild.id, serverInfo);
            }
            const maxMessageXp=5;
            const xp=Math.ceil(Math.random()*maxMessageXp)*serverInfo["xpPerMessage"];
            Utils.addXP(bot, message.author, xp, message.guild, message.channel);
            return message.channel.send(`You have earned ${xp} XP!`);
        }
        message.channel.send("As Iffffff i'm gonna give out free xp");
    }
}

module.exports=GiveXP;