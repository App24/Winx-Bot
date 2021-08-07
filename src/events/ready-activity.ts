import { BotUser } from "../BotClient";
import { VERSION, PREFIX } from "../Constants";
import { Localisation } from "../localisation";
import { BasicActivity } from "../structs/activities/BasicActivity";
import { BirthdayActivity } from "../structs/activities/events/BirthdayActivity";
import { ChristmasActivity } from "../structs/activities/events/ChristmasActivity";
import { HalloweenActivity } from "../structs/activities/events/HalloweenActivity";
import { NewYearActivity } from "../structs/activities/events/NewYearActivity";
import { PrideMonthActivity } from "../structs/activities/events/PrideMonthActivity";
import { StValentineActivity } from "../structs/activities/events/StValentineActivity";
import { UsersActivity } from "../structs/activities/UsersActivity";

let i=-1;
const activities=[
    new BasicActivity(Localisation.getTranslation("activity.basic.version", VERSION)),
    new BasicActivity(Localisation.getTranslation("activity.basic.help", PREFIX)),
    new BasicActivity(Localisation.getTranslation("activity.basic.suggestion", PREFIX)),
    new UsersActivity(),
    new BasicActivity(Localisation.getTranslation("activity.basic.contact", PREFIX)),
    new StValentineActivity(),
    new PrideMonthActivity(),
    new HalloweenActivity(),
    new ChristmasActivity(),
    new NewYearActivity(),
    //#region Birthdays
    new BirthdayActivity(new Date(2, 11, 10), "Bloom"),
    new BirthdayActivity(new Date(2, 5, 15), "Aisha"),
    new BirthdayActivity(new Date(2, 11, 16), "Tecna"),
    new BirthdayActivity(new Date(2, 2, 1), "Flora"),
    new BirthdayActivity(new Date(2, 4, 30), "Musa"),
    new BirthdayActivity(new Date(2, 7, 18), "Stella"),
    //#endregion
];

export=()=>{
    BotUser.on("ready", async()=>{
        setActivity();
        setInterval(async() => {
            setActivity();
        }, 1000*10);
    });
};

async function setActivity(){
    i++;
    if(i>=activities.length)
        i=0;
    if(activities[i].isShowable()){
        let activityText="";
        activityText=await activities[i].getActivity();
        BotUser.user.setActivity(activityText, {type: activities[i].type});
    }else{
        setActivity();
    }
}