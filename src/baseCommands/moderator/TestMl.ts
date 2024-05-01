import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DEFAULT_CARD_CODE } from "../../structs/databaseTypes/ServerUserSettings";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { WinxCharacter } from "../../structs/WinxCharacters";
import { CardData, drawCard } from "../../utils/CardUtils";
import { getMemberById } from "../../utils/GetterUtils";
import { getCurrentRank, getNextRank, getServerUserSettings } from "../../utils/RankUtils";
import { asyncForEach, canvasToMessageAttachment } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class TestMlBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const level = parseInt(cmdArgs.args[0]);
        if (isNaN(level) || level < 0) return cmdArgs.reply("error.invalid.level");
        let winxNumber = 0;
        if (cmdArgs.args.length > 1) {
            winxNumber = parseInt(cmdArgs.args[1]);
            if (isNaN(winxNumber) || winxNumber < 0) return cmdArgs.reply("error.invalid.level");
        }

        const user = cmdArgs.author;

        const leaderboardPosition = 0;
        const weekleaderboardPosition = 0;

        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");

        const userLevel = new UserLevel({guildId: cmdArgs.guildId, "levelData.userId": user.id});

        userLevel.levelData.xp = 0;
        userLevel.levelData.level = level;

        const currentRank = await getCurrentRank(userLevel.levelData.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.levelData.level, cmdArgs.guildId);

        const serverUserSettings = await getServerUserSettings(cmdArgs.author.id, cmdArgs.guildId);
        serverUserSettings.document.wingsLevel = -1;
        serverUserSettings.document.cardCode = DEFAULT_CARD_CODE;

        const cardData: CardData = {
            leaderboardPosition,
            weeklyLeaderboardPosition: weekleaderboardPosition,
            currentRank,
            nextRank,
            serverUserSettings,
            userLevel: userLevel.levelData,
            member
        };

        if (winxNumber > 0) {
            await asyncForEach(Object.keys(WinxCharacter), async (val) => {
                if (val === "None") return;
                if (isNaN(parseInt(val))) {
                    serverUserSettings.document.winxCharacter = WinxCharacter[val];
                    const { image, extension } = await drawCard(cardData);
                    await cmdArgs.reply({ content: val, files: [canvasToMessageAttachment(image, "magiclevels", extension)] });
                }
            });
        } else {
            const { image, extension } = await drawCard(cardData);
            cmdArgs.reply({ files: [canvasToMessageAttachment(image, "magiclevels", extension)] });
        }
    }
}