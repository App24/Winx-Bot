import { ApplicationCommandType } from "discord.js";
import { CharacterLinesBaseCommand } from "../../../baseCommands/characters/CharacterLines";
import { MultiSlashCommand } from "../../../structs/MultiCommand";
import { SlashCommand } from "../../../structs/SlashCommand";
import { capitalise } from "../../../utils/FormatUtils";

class CharacterLinesCommand extends SlashCommand {
    public constructor(name: string) {
        super({ name, description: `${capitalise(name)} Thingz`, type: ApplicationCommandType.ChatInput });
        this.baseCommand = new CharacterLinesBaseCommand(name);
    }
}

class CharacterLinesMultiCommand extends MultiSlashCommand {
    public generateCommand(): SlashCommand | Promise<SlashCommand> {
        return new CharacterLinesCommand(this.name);
    }
}

export = [
    new CharacterLinesMultiCommand("aisha"),
    new CharacterLinesMultiCommand("bloom"),
    new CharacterLinesMultiCommand("darcy"),
    new CharacterLinesMultiCommand("flora"),
    new CharacterLinesMultiCommand("icy"),
    new CharacterLinesMultiCommand("musa"),
    new CharacterLinesMultiCommand("stella"),
    new CharacterLinesMultiCommand("stormy"),
    new CharacterLinesMultiCommand("tecna"),
];