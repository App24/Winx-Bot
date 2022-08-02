import { CARD_CANVAS_HEIGHT, CARD_CANVAS_WIDTH } from "../../Constants";
import { Command, CommandArguments } from "../../structs/Command";

class WingsInfoCommand extends Command{
    public constructor() {
        super();
    }

    public onRun(cmdArgs: CommandArguments) {
        cmdArgs.message.reply(`Recommended custom wings image size: ${CARD_CANVAS_WIDTH}px by ${CARD_CANVAS_HEIGHT}px to prevent any empty space or image being cut off`);
    }
}

export=WingsInfoCommand;