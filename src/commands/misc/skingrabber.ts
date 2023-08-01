import { SkinGrabberBaseCommand } from "../../baseCommands/misc/SkinGrabber";
import { Command, CommandUsage } from "../../structs/Command";

class SkinGrabberCommand extends Command {
    public constructor() {
        super();

        this.usage = [new CommandUsage(true, "username", "UUID")];

        this.baseCommand = new SkinGrabberBaseCommand();
    }
}

//export = SkinGrabberCommand;