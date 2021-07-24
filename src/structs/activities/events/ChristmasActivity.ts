import { Localisation } from "../../../localisation";
import { OneDayEventActivity } from "../OneDayEventActivity";

export class ChristmasActivity extends OneDayEventActivity{
    public constructor(){
        super(new Date(2, 11, 25));
    }

    public getActivity(): string | Promise<string> {
        return Localisation.getTranslation("activity.event.christmas");
    }

}