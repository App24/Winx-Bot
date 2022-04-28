import { Localisation } from "../../../localisation";
import { capitalise } from "../../../utils/FormatUtils";
import { OneDayEventActivity } from "../OneDayEventActivity";

export class BirthdayActivity extends OneDayEventActivity {
    public name: string;

    public constructor(startTime: Date, name: string) {
        super(startTime);
        this.name = name;
    }

    public getActivity(): string | Promise<string> {
        return Localisation.getTranslation("activity.event.birthday", capitalise(this.name));
    }
}