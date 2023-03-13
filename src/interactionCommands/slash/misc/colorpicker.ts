import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { ColorPickerBaseCommand } from "../../../baseCommands/misc/ColorPicker";
import { SlashCommand } from "../../../structs/SlashCommand";

class ColorPickerCommand extends SlashCommand {
    public constructor() {
        super({
            name: "", description: "Get color from hex color!", type: ApplicationCommandType.ChatInput, options: [
                {
                    name: "hex",
                    description: "Hex code",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ]
        });

        this.baseCommand = new ColorPickerBaseCommand();
    }

    /*public async onRun(cmdArgs: SlashCommandArguments) {
        let color = cmdArgs.args[0].toLowerCase();
        if (color.startsWith("#")) {
            color = color.substring(1);
        }
        if (!isHexColor(color)) return cmdArgs.reply("error.invalid.hexcolor");
        cmdArgs.reply({ content: "generic.hexcolor", files: [canvasToMessageAttachment(canvasColor(color))] }, color);
    }*/
}

export = ColorPickerCommand;