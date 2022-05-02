import { BotUser } from "../BotClient";
import { VERSION, PREFIX } from "../Constants";
import { Localisation } from "../localisation";
import { BasicActivity } from "../structs/activities/BasicActivity";
import { BirthdayActivity } from "../structs/activities/events/BirthdayActivity";
import { GenericEventActivity } from "../structs/activities/GenericEventActivity";
import { GenericOneDayEventActivity } from "../structs/activities/GenericOneDayEventActivity";
import { UsersActivity } from "../structs/activities/UsersActivity";

let i = -1;
const activities = [
    new BasicActivity(Localisation.getTranslation("activity.basic.version", VERSION)),
    new BasicActivity(Localisation.getTranslation("activity.basic.help", PREFIX)),
    new BasicActivity(Localisation.getTranslation("activity.basic.suggestion", PREFIX)),

    new UsersActivity(),

    new BasicActivity(Localisation.getTranslation("activity.basic.contact", PREFIX)),

    new BasicActivity("🟦🟨 Slava Ukraini"),

    new GenericEventActivity(new Date(2, 5, 1), new Date(2, 6, 1), Localisation.getTranslation("activity.event.pride")),

    new GenericOneDayEventActivity(new Date(2, 1, 14), Localisation.getTranslation("activity.event.valentine")),
    new GenericOneDayEventActivity(new Date(2, 9, 31), Localisation.getTranslation("activity.event.halloween")),
    new GenericOneDayEventActivity(new Date(2, 11, 25), Localisation.getTranslation("activity.event.christmas")),
    new GenericOneDayEventActivity(new Date(2, 11, 31), Localisation.getTranslation("activity.event.newyear")),
    new GenericOneDayEventActivity(new Date(2, 8, 21), Localisation.getTranslation("activity.event.peaceday")),
    new GenericOneDayEventActivity(new Date(2, 10, 2), Localisation.getTranslation("activity.event.daydead")),
    new GenericOneDayEventActivity(new Date(2, 10, 20), Localisation.getTranslation("activity.event.childrenday")),
    new GenericOneDayEventActivity(new Date(22, 3, 20), Localisation.getTranslation("activity.event.earthday")),
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
    i++;
    if (i >= activities.length)
        i = 0;
    if (activities[i].isShowable()) {
        let activityText = "";
        activityText = await activities[i].getActivity();
        BotUser.user.setActivity(activityText, { type: activities[i].type });
    } else {
        setActivity();
    }
}