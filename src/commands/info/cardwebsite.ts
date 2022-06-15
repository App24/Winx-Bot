import { Command, CommandArguments } from "../../structs/Command";

class CardWebsiteCommand extends Command {
    public onRun(cmdArgs: CommandArguments) {
        cmdArgs.message.reply("https://app24.github.io/cardeditor/");
    }
}

export = CardWebsiteCommand;