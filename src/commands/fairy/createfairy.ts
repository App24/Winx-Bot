import { CreateFairyBaseCommand } from "../../baseCommands/fairy/CreateFairy";
import { Fairy } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class FairyCreateCommand extends Command {
    public constructor() {
        super();

        this.access = CommandAccess.BotOwner;
        this.available = CommandAvailable.Guild;

        this.category = Fairy;

        this.baseCommand = new CreateFairyBaseCommand();
    }
}

export = FairyCreateCommand;