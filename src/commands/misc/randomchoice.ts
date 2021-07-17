import { Message } from "discord.js";
import { Command, CommandUsage } from "../../structs/Command";

class RandomChoiceClass extends Command{
    public constructor(){
        super();
        this.minArgs=2;
        this.usage=[new CommandUsage(true, "choice1"), new CommandUsage(true, "choice2"), new CommandUsage(false, "choice3...")];
    }

    public onRun(message : Message, args : string[]){
        message.channel.send(args[Math.floor(args.length*Math.random())]);
    }
}

export=RandomChoiceClass;