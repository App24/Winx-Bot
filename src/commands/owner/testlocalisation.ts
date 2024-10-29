import { TestLocalisationBaseCommand } from "../../baseCommand/owner/TestLocalisation";
import { Command } from "../../structs/Command";

class TestLocalisationCommand extends Command{
    public constructor(){
        super(new TestLocalisationBaseCommand());
    }
}

export = TestLocalisationCommand;