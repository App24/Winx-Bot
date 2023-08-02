import { CardCodeBaseCommand } from "../../baseCommands/customisation/CardCode";
import { Customisation } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class CardCodeCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;

        this.baseCommand = new CardCodeBaseCommand();
    }
}

export = CardCodeCommand;