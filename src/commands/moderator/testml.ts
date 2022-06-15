import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandArguments, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { DEFAULT_CARD_CODE } from "../../structs/databaseTypes/ServerUserSettings";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { WinxCharacter } from "../../structs/WinxCharacters";
import { drawCard } from "../../utils/CardUtils";
import { getMemberById } from "../../utils/GetterUtils";
import { getCurrentRank, getNextRank, getServerUserSettings } from "../../utils/RankUtils";
import { asyncForEach, canvasToMessageAttachment } from "../../utils/Utils";

class TestMLCommand extends Command {
    public constructor() {
        super();
        this.category = Moderator;
        this.usage = [new CommandUsage(true, "argument.level"), new CommandUsage(false, "all")];
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.cooldown = 0;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const level = parseInt(cmdArgs.args[0]);
        if (isNaN(level) || level < 0) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.level"));
        let winxNumber = 0;
        if (cmdArgs.args.length > 1) {
            winxNumber = parseInt(cmdArgs.args[1]);
            if (isNaN(winxNumber) || winxNumber < 0) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.level"));
        }

        const user = cmdArgs.author;

        const leaderboardPosition = 0;

        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));

        const userLevel = new UserLevel(user.id);

        userLevel.xp = 0;
        userLevel.level = level;

        const currentRank = await getCurrentRank(userLevel.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.level, cmdArgs.guildId);

        const serverUserSettings = await getServerUserSettings(cmdArgs.author.id, cmdArgs.guildId);
        serverUserSettings.animatedCard = false;
        serverUserSettings.wingsLevel = -1;
        serverUserSettings.wingsLevelB = -1;
        serverUserSettings.cardCode = DEFAULT_CARD_CODE;

        if (winxNumber > 0) {
            await asyncForEach(Object.keys(WinxCharacter), async (val) => {
                if (val === "None") return;
                if (isNaN(parseInt(val))) {
                    serverUserSettings.winxCharacter = WinxCharacter[val];
                    const { image, extension } = await drawCard(leaderboardPosition, userLevel, serverUserSettings, currentRank, nextRank, member, cmdArgs.guild);
                    await cmdArgs.message.reply({ content: val, files: [canvasToMessageAttachment(image, "magiclevels", extension)] });
                }
            });
        } else {
            const { image, extension } = await drawCard(leaderboardPosition, userLevel, serverUserSettings, currentRank, nextRank, member, cmdArgs.guild);
            cmdArgs.message.reply({ files: [canvasToMessageAttachment(image, "magiclevels", extension)] });
        }

    }
}

export = TestMLCommand;