import { Message } from "discord.js";
import { Command, CommandArguments, CommandUsage } from "../../structs/Command";

class RandomChoiceClass extends Command{
    public constructor(){
        super();
        this.minArgs=2;
        this.usage=[new CommandUsage(true, "choice1"), new CommandUsage(true, "choice2"), new CommandUsage(false, "choice3...")];
    }

    public onRun(cmdArgs : CommandArguments){
        cmdArgs.channel.send(cmdArgs.args[Math.floor(cmdArgs.args.length*Math.random())]);
    }
}

export=RandomChoiceClass;