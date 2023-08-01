import { ActivityType } from "discord.js";
import { BotUser } from "../../BotClient";
import { Activity } from "./Activity";

export class UsersActivity extends Activity {
    public constructor() {
        super();
        this.type = ActivityType.Watching;
    }

    public getActivity(): string {
        return "activity.users";
    }

    public async getActivityArgs(): Promise<any[]> {
        const numUsers = BotUser.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        return [numUsers];
    }
}