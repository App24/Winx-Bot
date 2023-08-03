import { BotUser } from "../BotClient";
import { PREFIX } from "../Constants";
import { Localisation } from "../localisation";
import { BasicActivity } from "../structs/activities/BasicActivity";
import { BirthdayActivity } from "../structs/activities/events/BirthdayActivity";
import { GenericEventActivity } from "../structs/activities/GenericEventActivity";
import { GenericOneDayEventActivity } from "../structs/activities/GenericOneDayEventActivity";
import { UsersActivity } from "../structs/activities/UsersActivity";
import { reportBotError } from "../utils/Utils";

let i = -1;
const activities = [
    new BasicActivity("activity.basic.version", process.env.npm_package_version),
    new BasicActivity("activity.basic.help", PREFIX),
    new BasicActivity("activity.basic.suggestion", PREFIX),

    new UsersActivity(),

    new BasicActivity("activity.basic.contact", PREFIX),

    new BasicActivity("activity.event.ukraine"),

    new GenericEventActivity(new Date(2, 5, 1), new Date(2, 6, 1), "activity.event.pride"),

    new GenericOneDayEventActivity(new Date(2, 1, 14), "activity.event.valentine"),
    new GenericOneDayEventActivity(new Date(2, 2, 14), "activity.event.piday"),
    new GenericOneDayEventActivity(new Date(2, 9, 31), "activity.event.halloween"),
    new GenericOneDayEventActivity(new Date(2, 11, 25), "activity.event.christmas"),
    new GenericOneDayEventActivity(new Date(2, 0, 1), "activity.event.newyear"),
    new GenericOneDayEventActivity(new Date(2, 8, 21), "activity.event.peaceday"),
    new GenericOneDayEventActivity(new Date(2, 10, 2), "activity.event.daydead"),
    new GenericOneDayEventActivity(new Date(2, 10, 20), "activity.event.childrenday"),
    new GenericOneDayEventActivity(new Date(22, 3, 20), "activity.event.earthday"),
    //#region Birthdays
    new BirthdayActivity(new Date(2, 11, 10), "Bloom"),
    new BirthdayActivity(new Date(2, 5, 15), "Aisha"),
    new BirthdayActivity(new Date(2, 11, 16), "Tecna"),
    new BirthdayActivity(new Date(2, 2, 1), "Flora"),
    new BirthdayActivity(new Date(2, 4, 30), "Musa"),
    new BirthdayActivity(new Date(2, 7, 18), "Stella"),
    //#endregion
];

export = () => {
    BotUser.on("ready", async () => {
        setActivity();
        setInterval(async () => {
            setActivity();
        }, 1000 * 10);
    });
};

async function setActivity() {
    try {
        i++;
        if (i >= activities.length)
            i = 0;
        if (activities[i].isShowable()) {
            let activity = await activities[i].getActivity();
            if (!activities[i].translated) {
                activity = Localisation.getTranslation(activity, await activities[i].getActivityArgs());
            }
            BotUser.user.setActivity(activity, { type: activities[i].type });
        } else {
            setActivity();
        }
    } catch (error) {
        reportBotError(error);
    }
}