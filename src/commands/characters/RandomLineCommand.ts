import { Localisation } from "../../localisation";
import { Characters } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { capitalise } from "../../utils/FormatUtils";
import { MultiCommand } from "../../structs/MultiCommand";
import { CharacterLinesBaseCommand } from "../../baseCommands/characters/CharacterLines";

class CharacterLinesCommand extends Command {
    private name: string;

    public constructor(name: string) {
        super(Localisation.getLocalisation("tingz.command.description", capitalise(name)));
        this.name = name;
        this.category = Characters;

        this.baseCommand = new CharacterLinesBaseCommand(name);
    }
}

class CharacterLinesMultiCommand extends MultiCommand {
    public generateCommand() {
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