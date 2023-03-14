import { CardWebsiteBaseCommand } from "../../baseCommands/info/CardWebsite";
import { Info } from "../../structs/Category";
import { Command } from "../../structs/Command";

class CardWebsiteCommand extends Command {
    public constructor() {
        super();
        this.aliases = ["cardsite", "website"];

        this.category = Info;

        this.baseCommand = new CardWebsiteBaseCommand();
    }
}

export = CardWebsiteCommand;