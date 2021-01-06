const Command=require("../Command");

const command=new Command("restart");
command.ownerOnly=true;
command.hidden=true;
command.run=async(bot, message, args)=>{
    await message.channel.send("Restarting Bot!");
    bot.shard.broadcastEval('this.destroy()');
    bot.shard.broadcastEval('process.exit()');
};

module.exports=command;