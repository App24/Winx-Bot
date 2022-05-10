import { MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getBotRoleColor, getTextChannelById } from "../../utils/GetterUtils";
import { getServerDatabase } from "../../utils/Utils";

class ServerSettingsCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.category = Settings;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);

        const channel = await getTextChannelById(serverInfo.levelChannel, cmdArgs.guild);

        const embed = new MessageEmbed();
        embed.addField(Localisation.getTranslation("serversettings.category.xp"), serverInfo.maxXpPerMessage.toString());
        embed.addField(Localisation.getTranslation("serversettings.category.messagemax"), serverInfo.maxMessagePerMinute.toString());
        embed.addField(Localisation.getTranslation("serversettings.category.minmessagelength"), serverInfo.minMessageLength.toString());
        embed.addField(Localisation.getTranslation("serversettings.category.maxmessagelength"), serverInfo.maxMessageLength.toString());
        embed.addField(Localisation.getTranslation("serversettings.category.levelchannel"), `${channel || Localisation.getTranslation("generic.none")}`);
        embed.addField(Localisation.getTranslation("serversettings.category.ranks"), ranks.length.toString());
        embed.addField(Localisation.getTranslation("serversettings.category.excludechannels"), serverInfo.excludeChannels.length.toString());
        //embed.addField(Localisation.getTranslation("serversettings.category.leaderboardcolor"), `#${serverInfo.leaderboardColor}`);
        //embed.addField(Localisation.getTranslation("serversettings.category.leaderboardhighlight"), `#${serverInfo.leaderboardHighlight}`);
        embed.setColor(await getBotRoleColor(cmdArgs.guild));

        cmdArgs.message.reply({ embeds: [embed] });
    }
}

export = ServerSettingsCommand;