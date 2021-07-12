import { Message } from "discord.js";
import { Command } from "../../structs/Command";

class RandomChoiceClass extends Command{
    public constructor(){
        super("Choose a random option");
        this.minArgs=2;
        this.usage="<choice1> <choice2> [choice3] ...";
    }

    public onRun(message : Message, args : string[]){
        message.channel.send(args[Math.floor(args.length*Math.random())]);
    }
}

export=RandomChoiceClass;