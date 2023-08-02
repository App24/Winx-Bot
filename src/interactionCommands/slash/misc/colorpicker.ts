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
}

export = ColorPickerCommand;