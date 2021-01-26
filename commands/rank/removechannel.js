const Command=require("../../Command");
const Utils=require("../../Utils");

const command=new Command("removechannel");
command.description="Excludes a channel from being used for leveling";
command.args=true;
command.usage="<channel/list> [clear]";
command.permissions=["MANAGE_GUILD"];
command.hidden=true;
command.run=async(bot, message, args)=>{
    if(args.length<1){
        return message.channel.send("You must provide 1 argument");
    }
    const Excludes=bot.tables["excludes"];
    let excludes=await Excludes.get(message.guild.id);
    if(!excludes){
        await Excludes.set(message.guild.id, []);
        excludes=await Excludes.get(message.guild.id);
    }
    if(args[0].toLowerCase()==="list"){
        if(excludes.length<=0) return message.channel.send("No excluded Channels");
        var text="";
        await Utils.asyncForEach(excludes, async(exclude)=>{
            const channel=await Utils.getChannelById(exclude["id"], message.guild);
            if(channel) text+=`${channel}\n`;
        });
        if(text.length<=0) return;
        return message.channel.send(text);
    }
    const channel=await Utils.getChannelFromMention(args[0], message.guild);
    if(!channel) return message.channel.send("You must provide a channel!");
    let excludedChannel=await excludes.find(u=>u["id"]===channel.id);
    if(args[1]){
        if(args[1].toLowerCase()==="clear"){
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
    }
    if(excludedChannel){
        return message.channel.send(`${channel} is already excluded!`);
    }
    excludes.push({"id":channel.id});
    await Excludes.set(message.guild.id, excludes);
    return message.channel.send(`${channel} is now excluded!`);
};

module.exports=command;
