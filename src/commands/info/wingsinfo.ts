import { WingsInfoBaseCommand } from "../../baseCommands/info/WingsInfo";
import { Info } from "../../structs/Category";
import { Command } from "../../structs/Command";

class WingsInfoCommand extends Command {
    public constructor() {
        super();

        this.category = Info;

        this.baseCommand = new WingsInfoBaseCommand();
    }

    // public onRun(cmdArgs: CommandArguments) {
    //     cmdArgs.message.reply(`Recommended custom wings image size: ${CARD_CANVAS_WIDTH}px by ${CARD_CANVAS_HEIGHT}px to prevent any empty space or image being cut off`);
    // }
}

export = WingsInfoCommand;