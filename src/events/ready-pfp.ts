import { existsSync } from "fs";
import { BotUser } from "../BotClient";

const pfps: { startDate: Date, endDate: Date, path: string }[] = [
    {
        startDate: new Date(2, 5, 1),
        endDate: new Date(2, 5, 3),
        path: "pride_ace"
    },
    {
        startDate: new Date(2, 5, 3),
        endDate: new Date(2, 5, 5),
        path: "pride_agender"
    },
    {
        startDate: new Date(2, 5, 5),
        endDate: new Date(2, 5, 7),
        path: "pride_aro"
    },
    {
        startDate: new Date(2, 5, 7),
        endDate: new Date(2, 5, 9),
        path: "pride_bi"
    },
    {
        startDate: new Date(2, 5, 9),
        endDate: new Date(2, 5, 11),
        path: "pride_gay"
    },
    {
        startDate: new Date(2, 5, 11),
        endDate: new Date(2, 5, 13),
        path: "pride_gf"
    },
    {
        startDate: new Date(2, 5, 13),
        endDate: new Date(2, 5, 15),
        path: "pride_les"
    },
    {
        startDate: new Date(2, 5, 15),
        endDate: new Date(2, 5, 17),
        path: "pride_nb"
    },
    {
        startDate: new Date(2, 5, 17),
        endDate: new Date(2, 5, 19),
        path: "pride_pan"
    },
    {
        startDate: new Date(2, 5, 19),
        endDate: new Date(2, 5, 21),
        path: "pride_gq"
    },
    {
        startDate: new Date(2, 5, 21),
        endDate: new Date(2, 5, 23),
        path: "pride_trans"
    },
    {
        startDate: new Date(2, 5, 23),
        endDate: new Date(2, 5, 24),
        path: "pride_ace"
    },
    {
        startDate: new Date(2, 5, 24),
        endDate: new Date(2, 5, 25),
        path: "pride_bi"
    },
    {
        startDate: new Date(2, 5, 25),
        endDate: new Date(2, 5, 26),
        path: "pride_gay"
    },
    {
        startDate: new Date(2, 5, 26),
        endDate: new Date(2, 5, 27),
        path: "pride_les"
    },
    {
        startDate: new Date(2, 5, 27),
        endDate: new Date(2, 5, 28),
        path: "pride_gf"
    },
    {
        startDate: new Date(2, 5, 28),
        endDate: new Date(2, 5, 29),
        path: "pride_pan"
    },
    {
        startDate: new Date(2, 5, 29),
        endDate: new Date(2, 5, 30),
        path: "pride_trans"
    },
    {
        startDate: new Date(2, 5, 30),
        endDate: new Date(2, 6, 1),
        path: "pride"
    }
];

export = () => {
    BotUser.on("ready", async () => {
        const midnight = new Date();
        midnight.setHours(24);
        midnight.setMinutes(1);
        midnight.setSeconds(0);
        midnight.setMilliseconds(0);
        updatePfp();
        setTimeout(() => {
            updatePfp();
            setInterval(() => {
                updatePfp();
            }, 1000 * 60 * 60 * 24);
        }, midnight.getTime() - new Date().getTime());
    });
};

async function updatePfp() {
    const currentDay = new Date();
    currentDay.setFullYear(2);

    const pfp = getPfp(currentDay);

    const previousDay = new Date(Date.now() - 86400000);
    previousDay.setFullYear(2);

    const previousPfp = getPfp(previousDay);

    if (pfp === previousPfp) return;

    if (!pfp) {
        BotUser.user.setAvatar("./pfps/default_uk.png");
        return;
    }

    if (!existsSync(`./pfps/${pfp.path}.png`)) {
        console.error(`Couldnt find pfp '${pfp.path}'`);
        return;
    }

    BotUser.user.setAvatar(`./pfps/${pfp.path}.png`);
}

function getPfp(date: Date) {
    date.setFullYear(2);

    return pfps.find(pfp => {
        const startDay = pfp.startDate;
        startDay.setHours(0);
        startDay.setMinutes(0);
        startDay.setSeconds(0);
        startDay.setMilliseconds(0);
        startDay.setFullYear(2);

        const endDay = pfp.endDate;
        endDay.setHours(0);
        endDay.setMinutes(0);
        endDay.setSeconds(0);
        endDay.setMilliseconds(0);
        endDay.setFullYear(2);

        return date >= startDay && date < endDay;
    });
}