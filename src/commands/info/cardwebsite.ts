import { Command, CommandArguments } from "../../structs/Command";

class CardWebsiteCommand extends Command {
    public constructor() {
        super();
        this.aliases = ["cardsite", "website"];
    }

    public onRun(cmdArgs: CommandArguments) {
        cmdArgs.message.reply("https://app24.github.io/cardeditor/");
    }
}

export = CardWebsiteCommand;