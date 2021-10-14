import { Localisation } from "../../../localisation";
import { OneDayEventActivity } from "../OneDayEventActivity";

export class DayDeadActivity extends OneDayEventActivity{
    public constructor(){
        super(new Date(2, 10, 2));
    }

    public getActivity(): string | Promise<string> {
        return Localisation.getTranslation("activity.event.daydead");
    }

}