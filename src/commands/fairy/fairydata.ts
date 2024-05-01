import { FairyDataBaseCommand } from "../../baseCommands/fairy/FairyData";
import { Fairy } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";

class FairyDataCommand extends Command {
    public constructor() {
        super();

        this.category = Fairy;

        this.baseCommand = new FairyDataBaseCommand();
    }
}

export = FairyDataCommand;