import { EmbedBuilder } from "discord.js";
import { CheckErrorBaseCommand } from "../../baseCommands/owner/CheckError";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Owner } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ErrorStruct } from "../../structs/databaseTypes/ErrorStruct";
import { dateToString } from "../../utils/FormatUtils";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getStringReply } from "../../utils/ReplyUtils";
import { asyncForEach } from "../../utils/Utils";

class CheckErrorCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.category = Owner;

        this.baseCommand = new CheckErrorBaseCommand();
    }
}

export = CheckErrorCommand;