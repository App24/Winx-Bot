import { BotUser } from "../BotClient";
import { DatabaseType } from "../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../structs/databaseTypes/ServerInfo";
import { asyncMapForEach } from "../utils/Utils";

export = () => {
    BotUser.on("ready", async () => {
        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        await asyncMapForEach(BotUser.guilds.cache, async (_, server) => {
            let serverInfo: ServerInfo = await ServerInfo.get(server.id);
            if (!serverInfo) serverInfo = DEFAULT_SERVER_INFO;

            if (!serverInfo.maxXpPerMessage) serverInfo.maxXpPerMessage = DEFAULT_SERVER_INFO.maxXpPerMessage;

            if (!serverInfo.maxMessageLength) serverInfo.maxMessageLength = DEFAULT_SERVER_INFO.maxMessageLength;

            if (!serverInfo.minMessageLength) serverInfo.minMessageLength = DEFAULT_SERVER_INFO.minMessageLength;

            if (!serverInfo.maxMessagePerMinute) serverInfo.maxMessagePerMinute = DEFAULT_SERVER_INFO.maxMessagePerMinute;

            if (!serverInfo.excludeChannels) serverInfo.excludeChannels = DEFAULT_SERVER_INFO.excludeChannels;

            if (!serverInfo.levelChannel) serverInfo.levelChannel = DEFAULT_SERVER_INFO.levelChannel;

            //if (!serverInfo.leaderboardColor) serverInfo.leaderboardColor = DEFAULT_SERVER_INFO.leaderboardColor;

            //if (!serverInfo.leaderboardHighlight) serverInfo.leaderboardHighlight = DEFAULT_SERVER_INFO.leaderboardHighlight;

            await ServerInfo.set(server.id, serverInfo);
        });
    });
};