import { Localisation } from "../../../localisation";
import { OneDayEventActivity } from "../OneDayEventActivity";

export class NewYearActivity extends OneDayEventActivity{
    public constructor(){
        super(new Date(2, 11, 31));
    }

    public getActivity(): string | Promise<string> {
        return Localisation.getTranslation("activity.event.newyear");
    }

}