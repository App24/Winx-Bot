import Discord from 'discord.js';
import Command from '../../Command';
import * as Utils from '../../Utils';

class CheckError extends Command{
    constructor(){
        super();
        this.creatorOnly=true;
        this.args=true;
        this.usage="<error id/clear/list/prune>";
        this.guildOnly=false;
        this.category=Command.OwnerCategory;
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const Errors=bot.getDatabase("errors");
        if(args[0].toLowerCase()==="clear"){
            await Errors.clear();
            return message.channel.send("Cleared!");
        }else if(args[0].toLowerCase()==="list"){
            const errors=await Errors.keys();
            if(!errors.length) return message.channel.send("No errors!");
            return message.channel.send(errors);
        }else if(args[0].toLowerCase()==="prune"){
            const errors=await Errors.entries();
            if(!errors.length) return message.channel.send("No errors!");
            const msPerMinute = 60 * 1000;
            const msPerHour = msPerMinute * 60;
            const msPerDay = msPerHour * 24;
            const msPerWeek = msPerDay * 7;
            const currentTime=new Date().getTime();
            await Errors.clear();
            await Utils.asyncForEach(errors, async(_error)=>{
                const error=JSON.parse(_error[1]);
                if(currentTime-error.time>msPerWeek*2){
                    await Errors.set(_error[0], JSON.stringify(error));
                }
            });
            return message.channel.send("Finished pruning 2+ week old errors!");
        }
        var errors=await Errors.get(args[0]);
        if(!errors) return message.reply("there is no error by that ID!");
        const error=JSON.parse(errors);
        message.channel.send(`${new Date(error.time).toISOString().slice(0,10)}\n\`\`\`${error.error}\`\`\``);
    }

}

module.exports=CheckError;