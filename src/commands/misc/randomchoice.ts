import { Command, CommandUsage, CommandArguments } from "../../structs/Command";

class RandomChoiceClass extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(true, "choice1"), new CommandUsage(true, "choice2"), new CommandUsage(false, "choice3...")];
    }

    public onRun(cmdArgs: CommandArguments) {
        cmdArgs.message.reply(cmdArgs.args[Math.floor(cmdArgs.args.length * Math.random())]);
    }
}

export = RandomChoiceClass;