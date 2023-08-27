import { BotUser } from "../BotClient";
import { checkWeeklyLeaderboard } from "../utils/Utils";

export = () => {
    BotUser.on("ready", async () => {
        const midnight = new Date();
        midnight.setHours(24);
        midnight.setMinutes(1);
        midnight.setSeconds(0);
        midnight.setMilliseconds(0);
        BotUser.guilds.cache.forEach(guild => {
            checkWeeklyLeaderboard(guild);
        });
        setTimeout(() => {
            setInterval(() => {
                BotUser.guilds.cache.forEach(guild => {
                    checkWeeklyLeaderboard(guild);
                });
            }, 1000 * 60 * 60 * 24);
        }, midnight.getTime() - new Date().getTime());
    });
};