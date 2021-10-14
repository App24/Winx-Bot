import { Localisation } from "../../../localisation";
import { OneDayEventActivity } from "../OneDayEventActivity";

export class PeaceDayActivity extends OneDayEventActivity{
    public constructor(){
        super(new Date(2, 8, 21));
    }

    public getActivity(): string | Promise<string> {
        return Localisation.getTranslation("activity.event.peaceday");
    }

}