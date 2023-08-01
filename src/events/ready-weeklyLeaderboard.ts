import { BotUser } from "../BotClient";
import { checkWeeklyLeaderboard } from "../utils/Utils";

export = () => {
    BotUser.on("ready", async () => {
        const midnight = new Date();
        midnight.setHours(24);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMilliseconds(0);
        setTimeout(() => {
            BotUser.guilds.cache.forEach(guild => {
                checkWeeklyLeaderboard(guild);
            });
            setInterval(() => {
                BotUser.guilds.cache.forEach(guild => {
                    checkWeeklyLeaderboard(guild);
                });
            }, 1000 * 60 * 60 * 24);
        }, midnight.getTime() - new Date().getTime());
    });
};