import { RPSBaseCommand } from "../../baseCommands/minigames/RPS";
import { Minigames } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class RPSCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Minigames;
        this.aliases = ["rockpaperscissors"];

        this.baseCommand = new RPSBaseCommand();
    }
}

export = RPSCommand;