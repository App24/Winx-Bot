import { DndStatsBaseCommand } from "../../baseCommands/misc/DndStats";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class DndStatsCommand extends Command {
    public constructor() {
        super();

        this.available = CommandAvailable.Guild;

        this.baseCommand = new DndStatsBaseCommand();

        this.usage = [new CommandUsage(false, "argument.user")];
    }
}

export = DndStatsCommand;