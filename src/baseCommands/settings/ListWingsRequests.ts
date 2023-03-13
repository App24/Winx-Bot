import { BotUser } from "../../BotClient";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { WingsRequest } from "../../structs/databaseTypes/WingsRequest";
import { getTextChannelById } from "../../utils/GetterUtils";
import { getServerDatabase, asyncForEach } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { createWingsRequest } from "../customisation/CustomWings";

export class ListWingsRequestsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        const WingsRequests = BotUser.getDatabase(DatabaseType.WingsRequests);
        const wingsRequests: WingsRequest[] = await getServerDatabase(WingsRequests, cmdArgs.guildId);

        if (!serverInfo.wingsRequestChannel) {
            return cmdArgs.reply("There is no set wings request channel!");
        }

        const channel = await getTextChannelById(serverInfo.wingsRequestChannel, cmdArgs.guild);

        await asyncForEach(wingsRequests, async (wingsRequest) => {
            createWingsRequest(wingsRequest, cmdArgs.guild, channel);
        });

        cmdArgs.reply("generic.done");
    }
}