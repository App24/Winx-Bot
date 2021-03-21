import { Message } from 'discord.js';
import Command from '../../Command';

class RandomChoice extends Command{
    constructor(){
        super();
        this.minArgsLength=2;
        this.description="Choose a random option";
        this.usage="<choice1> <choice2> [choice3] ...";
        this.guildOnly=false;
    }
    
    public onRun(bot: import("../../BotClient"), message: Message, args: string[]) {
        message.channel.send(args[Math.floor(Math.random()*args.length)]);
    }
}

module.exports=RandomChoice;