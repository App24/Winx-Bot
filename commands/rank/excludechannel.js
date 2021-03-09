const Command=require("../../Command");
const Utils=require("../../Utils");

class ExcludeChannel extends Command{
    constructor(){
        super("excludechannel");
        this.modOnly=true;
        this.args=true;
        this.usage="<channel/list> [remove]";
        this.description="Excludes a channel from being used for leveling";
        this.category=Command.RankCategory;
    }

    async onRun(bot, message, args){
        const Excludes=bot.tables["excludes"];
        const excludes=await Utils.getServerDatabase(Excludes, message.guild.id);
        if(args[0].toLowerCase()==="list"){
            if(excludes.length<=0) return message.channel.send("No excluded channels!");
            var text="";
            await Utils.asyncForEach(excludes, async(exclude)=>{
                const channel=await Utils.getChannelByID(exclude["id"], message.guild);
                if(channel)text+=`${channel}\n`;
            });
            if(text.length<=0) return;
            return message.channel.send(text);
        }
        const channel=await Utils.getChannelFromMention(args[0], message.guild);
        if(!channel) return message.reply("You must provide a channel!");
        let excludedChannel=await excludes.find(c=>c["id"]===channel.id);
        if(args[1]&&args[1].toLowerCase()==="remove"){
            if(!excludes){
                return message.channel.send("This guild does not contain any excluded channels");
            }
            if(!excludedChannel){
                return message.channel.send(`The channel ${channel.name} is not excluded!`);
            }
            const index=excludes.indexOf(excludedChannel);
            if(index>-1) excludes.splice(index,1);
            await Excludes.set(message.guild.id, excludes);
            return message.channel.send(`${channel} is no longer excluded!`);
        }
        if(excludedChannel){
            return message.channel.send(`${channel} is already excluded!`);
        }
        excludes.push({"id":channel.id});
        await Excludes.set(message.guild.id, excludes);
        return message.channel.send(`${channel} is now excluded!`);
    }
}

module.exports=ExcludeChannel;