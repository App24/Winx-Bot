import { Localisation } from "../../../localisation";
import { OneDayEventActivity } from "../OneDayEventActivity";

export class EarthDayActivity extends OneDayEventActivity {
    public constructor() {
        super(new Date(22, 3, 20));
    }

    public getActivity(): string | Promise<string> {
        return Localisation.getTranslation("activity.event.earthday");
    }

}