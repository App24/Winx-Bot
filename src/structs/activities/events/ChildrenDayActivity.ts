import { Localisation } from "../../../localisation";
import { OneDayEventActivity } from "../OneDayEventActivity";

export class ChildrenDayActivity extends OneDayEventActivity {
    public constructor() {
        super(new Date(2, 10, 20));
    }

    public getActivity(): string | Promise<string> {
        return Localisation.getTranslation("activity.event.childrenday");
    }

}