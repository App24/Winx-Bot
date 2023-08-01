import { WeeklyAnnouncementChannelBaseCommand } from "../../baseCommands/settings/WeeklyAnnouncementChannel";
import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

class WeeklyAnnouncementCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.access = CommandAccess.Moderators;
        this.category = Settings;

        this.baseCommand = new WeeklyAnnouncementChannelBaseCommand();
    }
}

export = WeeklyAnnouncementCommand;