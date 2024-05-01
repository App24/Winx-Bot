import { TicTacToeBaseCommand } from "../../baseCommands/minigames/TicTacToe";
import { Minigames } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class TicTacToeCommand extends Command {

    public constructor() {
        super();
        this.category = Minigames;
        this.aliases = ["n&c", "ttt"];

        this.baseCommand = new TicTacToeBaseCommand();
    }
}

export = TicTacToeCommand;