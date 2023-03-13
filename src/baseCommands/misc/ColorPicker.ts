import { canvasColor } from "../../utils/CanvasUtils";
import { isHexColor, canvasToMessageAttachment } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class ColorPickerBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        let color = cmdArgs.args[0].toLowerCase();
        if (color.startsWith("#")) {
            color = color.substring(1);
        }
        if (!isHexColor(color)) return cmdArgs.reply("error.invalid.hexcolor");
        cmdArgs.reply({ content: "generic.hexcolor", files: [canvasToMessageAttachment(canvasColor(color))] }, color);
    }
}