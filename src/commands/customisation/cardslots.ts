import { CardSlotsBaseCommand } from "../../baseCommands/customisation/CardSlots";
import { Customisation } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class CardSlotsCommand extends Command {
    public constructor() {
        super();

        this.available = CommandAvailable.Guild;

        this.baseCommand = new CardSlotsBaseCommand();
        this.category = Customisation;

        this.aliases = ["cardslot"];
    }
}

export = CardSlotsCommand;