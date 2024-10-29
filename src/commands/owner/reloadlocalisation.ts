import { ReloadLocalisationBaseCommand } from "../../baseCommand/owner/ReloadLocalisation";
import { Command } from "../../structs/Command";

class ReloadLocalisationCommand extends Command{
    public constructor(){
        super(new ReloadLocalisationBaseCommand());
        this.aliases = ["relocal"];
    }
}

export = ReloadLocalisationCommand;