import { ColorPickerBaseCommand } from "../../baseCommands/misc/ColorPicker";
import { Command, CommandUsage } from "../../structs/Command";

class ColorPickerCommand extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(true, "argument.hexcolor")];
        this.aliases = ["colourpicker"];

        this.baseCommand = new ColorPickerBaseCommand();
    }
}

export = ColorPickerCommand;