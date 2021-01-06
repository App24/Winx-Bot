const Command=require("../../Command");
const Utils=require("../../Utils");

const command=new Command("setrank");
command.description="Set a Rank";
command.usage="<level above 0> <role or clear>";
command.args=true;
command.permissions=["MANAGE_GUILD"];
command.hidden=true;
command.run=async(bot, message, args)=>{
    if(args.length<2){
        return message.channel.send("You must provide 2 arguments");
    } 
    const level=parseInt(args[0]);
    if(isNaN(level)||level<0) return message.reply(`\`${args[0]}\` does not seem to be a valid number!`);
    const Ranks=bot.tables["ranks"];
    let ranks=await Ranks.get(message.guild.id);
    if(args[1].toLowerCase()==="clear"){
        if(!ranks){
            return message.channel.send("This guild does not contain any ranks!");
        }
        let rankLevel=await ranks.find(u=>u["level"]===level);
        if(!rankLevel){
            return message.channel.send(`There is no rank assigned to level ${level}`);
        }
        const index=ranks.indexOf(rankLevel);
        if(index>-1) ranks.splice(index,1);
        await Ranks.set(message.guild.id, ranks);
        return message.channel.send(`Cleared rank for level ${level}`);
    }
    const role=await Utils.getRoleFromMention(args[1], message.guild);
    if(!role) return message.reply('You must provide a valid role!');
    if(!ranks){
        await Ranks.set(message.guild.id, []);
        ranks=await Ranks.get(message.guild.id);
    }
    let rankLevel=await ranks.find(u=>u["level"]===level);
    if(!rankLevel){
        ranks.push({"level": level, "role": role.id});
        await Ranks.set(message.guild.id, ranks);
    }
    const index=ranks.indexOf(rankLevel);
    rankLevel["role"]=role.id;
    ranks[index]=rankLevel;
    await Ranks.set(message.guild.id, ranks);
    return message.channel.send(`\`${role.name}\` has been set as rank for level ${level}`);
}

module.exports=command;