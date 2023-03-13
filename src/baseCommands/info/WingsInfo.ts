import { CARD_CANVAS_WIDTH, CARD_CANVAS_HEIGHT } from "../../Constants";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class WingsInfoBaseCommand extends BaseCommand{
    public onRun(cmdArgs: BaseCommandType) {
        cmdArgs.reply(`Recommended custom wings image size: ${CARD_CANVAS_WIDTH}px by ${CARD_CANVAS_HEIGHT}px to prevent any empty space or image being cut off`);
    }
}