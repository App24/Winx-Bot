import { WinxCharacterBaseCommand } from "../../baseCommands/customisation/WinxCharacter";
import { Customisation } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class WinxCharacterCommand extends Command {
    public constructor() {
        super();
        this.category = Customisation;
        this.aliases = ["setcharacter", "setwinx"];

        this.baseCommand = new WinxCharacterBaseCommand();
    }
}

export = WinxCharacterCommand;