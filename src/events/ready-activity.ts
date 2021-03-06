import { BotUser } from "../BotClient";
import { PREFIX, VERSION } from "../Constants";
import { BasicActivity } from "../structs/activities/BasicActivity";
import { BirthdayActivity } from "../structs/activities/events/BirthdayActivity";
import { ChristmasActivity } from "../structs/activities/events/ChristmasActivity";
import { NewYearActivity } from "../structs/activities/events/NewYearActivity";
import { PrideMonthActivity } from "../structs/activities/events/PrideMonthActivity";
import { UsersActivity } from "../structs/activities/UsersActivity";

let i=-1;
const activities=[
    new BasicActivity(`Version: ${VERSION}`),
    new BasicActivity(`${PREFIX}help for help!`),
    new BasicActivity(`${PREFIX}suggestion for your suggestion!`),
    new UsersActivity(),
    new BasicActivity(`${PREFIX}contactcreator to contact the creator of the bot!`),
    new PrideMonthActivity(),
    new ChristmasActivity(),
    new NewYearActivity(),
    //#region Birthdays
    new BirthdayActivity(new Date(2, 11, 10), new Date(2, 11, 11), "Bloom"),
    new BirthdayActivity(new Date(2, 5, 15), new Date(2, 5 ,16), "Aisha"),
    new BirthdayActivity(new Date(2, 11, 16), new Date(2, 11, 17), "Tecna"),
    new BirthdayActivity(new Date(2, 2, 1), new Date(2, 2, 2), "Flora"),
    new BirthdayActivity(new Date(2, 4, 30), new Date(2, 4, 31), "Musa"),
    new BirthdayActivity(new Date(2, 7, 18), new Date(2, 7, 19), "Stella"),
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
    if(activities[i].canRun()){
        let activityText="";
        activityText=await activities[i].getActivity();
        BotUser.user.setActivity(activityText);
    }else{
        setActivity();
    }
}