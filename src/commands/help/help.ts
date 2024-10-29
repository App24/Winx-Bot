import { HelpBaseCommand } from "../../baseCommand/misc/Help";
import { Command } from "../../structs/Command";

class HelpCommand extends Command{
    public constructor(){
        super(new HelpBaseCommand());
    }
}

export = HelpCommand;