import { ServerData } from "../../structs/databaseTypes/ServerData";
import { WingsRequest } from "../../structs/databaseTypes/WingsRequest";
import { getTextChannelById } from "../../utils/GetterUtils";
import { asyncForEach, getOneDatabase, getDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { createWingsRequest } from "../customisation/CustomWings";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class ListWingsRequestsBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const serverInfo = await getOneDatabase(ServerData, { guildId: cmdArgs.guildId }, () => new ServerData({ guildId: cmdArgs.guildId }));

        const wingsRequests = await getDatabase(WingsRequest, { guildId: cmdArgs.guildId });

        if (!serverInfo.document.wingsRequestChannel) {
            return cmdArgs.reply("There is no set wings request channel!");
        }

        const channel = await getTextChannelById(serverInfo.document.wingsRequestChannel, cmdArgs.guild);

        await asyncForEach(wingsRequests, async (wingsRequest) => {
            createWingsRequest(wingsRequest, cmdArgs.guild, channel);
        });

        cmdArgs.reply("generic.done");
    }
}