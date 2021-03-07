const Command=require("../../Command");
const Utils=require("../../Utils");

class LevelChannel extends Command{
    constructor(){
        super("levelchannel");
        this.args=true;
        this.modOnly=true;
        this.usage="<channel/list/clear>";
        this.description="Sets the Levels Channel!";
        this.category=Command.SettingsCategory;
    }

    async onRun(bot, message, args){
        const ServerInfo=bot.tables["serverInfo"];
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id);

        if(args[0].toLowerCase()==="list"){
            if(serverInfo["levelChannel"]){
                const channel=await Utils.getChannelByID(serverInfo["levelChannel"], message.guild);
                return message.channel.send(`Channel: ${channel}`);
            }else{
                return message.channel.send(`No levels channel!`);
            }
        }else if(args[0].toLowerCase()==="clear"){
            if(serverInfo["levelChannel"]){
                delete serverInfo["levelChannel"];
                await ServerInfo.set(message.guild.id, serverInfo);
                return message.channel.send(`Removed levels channel!`);
            }else{
                return message.channel.send("There is no set levels channel!");
            }
        }

        const channel=await Utils.getChannelFromMention(args[0], message.guild);
        if(!channel) return message.reply(`${args[0]} is not a valid channel!`);
        serverInfo["levelChannel"]=channel.id;
        await ServerInfo.set(message.guild.id, serverInfo);
        message.channel.send(`Set levels channel to ${channel}`);
    }
}

module.exports=LevelChannel;