import { Localisation } from "../../../localisation";
import { OneDayEventActivity } from "../OneDayEventActivity";

export class StValentineActivity extends OneDayEventActivity {
    public constructor() {
        super(new Date(2, 1, 14));
    }

    public getActivity(): string {
        return Localisation.getTranslation("activity.event.valentine");
    }

}