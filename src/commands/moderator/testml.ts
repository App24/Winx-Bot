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
import { TestMlBaseCommand } from "../../baseCommands/moderator/TestMl";

class TestMLCommand extends Command {
    public constructor() {
        super();
        this.category = Moderator;
        this.usage = [new CommandUsage(true, "argument.level"), new CommandUsage(false, "all")];
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.baseCommand = new TestMlBaseCommand();
    }
}

export = TestMLCommand;