import { Localisation } from "../../localisation";
import { Command, CommandUsage, CommandArguments } from "../../structs/Command";
import { canvasColor } from "../../utils/CanvasUtils";
import { isHexColor, canvasToMessageAttachment } from "../../utils/Utils";

class ColorPickerCommand extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(true, "argument.hexcolor")];
        this.aliases = ["colourpicker"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        let color = cmdArgs.args[0].toLowerCase();
        if (color.startsWith("#")) {
            color = color.substring(1);
        }
        if (!isHexColor(color)) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.hexcolor"));
        cmdArgs.message.reply({ content: Localisation.getTranslation("generic.hexcolor", color), files: [canvasToMessageAttachment(canvasColor(color))] });
    }
}

export = ColorPickerCommand;