import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { Owner } from "../../structs/Category";
import { RegisterSlashCommandsBaseCommand } from "../../baseCommands/owner/SlashCommands";

class RegisterSlashCommandsCommand extends Command {
    public constructor() {
        super();
        this.category = Owner;

        this.baseCommand = new RegisterSlashCommandsBaseCommand();
    }
}

export = RegisterSlashCommandsCommand;