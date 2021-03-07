const Command=require("../../Command");

class CheckError extends Command{
    constructor(){
        super("checkerror");
        this.ownerOnly=true;
        this.args=true;
        this.usage="<error id/clear/list>";
        this.guildOnly=false;
        this.category=Command.OwnerCategory;
    }

    async onRun(bot,message,args){
        const Errors=bot.tables["errors"];
        if(args[0].toLowerCase()==="clear"){
            await Errors.clear();
            return message.channel.send("Cleared!");
        }else if(args[0].toLowerCase()==="list"){
            const errors=await Errors.keys();
            if(!errors.length) return message.channel.send("No errors!");
            return message.channel.send(errors);
        }
        var errors=await Errors.get(args[0]);
        if(!errors) return message.reply("there is no error by that ID!");
        const error=JSON.parse(errors);
        message.channel.send(`${error.time}\n\`\`\`${error.error}\`\`\``);
    }
}

module.exports=CheckError;