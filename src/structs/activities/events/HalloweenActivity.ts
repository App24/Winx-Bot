import { Localisation } from "../../../localisation";
import { OneDayEventActivity } from "../OneDayEventActivity";

export class HalloweenActivity extends OneDayEventActivity{
    public constructor(){
        super(new Date(2, 9, 31));
    }

    public getActivity(): string {
        return Localisation.getTranslation("activity.event.halloween");
    }

}