import { ListWingsRequestsBaseCommand } from "../../baseCommands/settings/ListWingsRequests";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { WingsRequest } from "../../structs/databaseTypes/WingsRequest";
import { getTextChannelById } from "../../utils/GetterUtils";
import { asyncForEach, getServerDatabase } from "../../utils/Utils";

class ListWingsRequestsCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.access = CommandAccess.Moderators;
        this.category = Settings;

        this.baseCommand = new ListWingsRequestsBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
    //     const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

    //     const WingsRequests = BotUser.getDatabase(DatabaseType.WingsRequests);
    //     const wingsRequests: WingsRequest[] = await getServerDatabase(WingsRequests, cmdArgs.guildId);

    //     if (!serverInfo.wingsRequestChannel) {
    //         return cmdArgs.message.reply("There is no set wings request channel!");
    //     }

    //     const channel = await getTextChannelById(serverInfo.wingsRequestChannel, cmdArgs.guild);

    //     await asyncForEach(wingsRequests, async (wingsRequest) => {
    //         createWingsRequest(wingsRequest, cmdArgs.guild, channel);
    //     });

    //     cmdArgs.message.reply(Localisation.getTranslation("generic.done"));
    // }
}

export = ListWingsRequestsCommand;