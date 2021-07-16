import { Localisation } from "../../../localisation";
import { EventActivity } from "../EventActivity";

export class PrideMonthActivity extends EventActivity{
    public constructor(){
        super(new Date(2, 5, 1), new Date(2, 6, 1));
    }

    public getActivity(): string {
        return Localisation.getTranslation("activity.event.pride");
    }

}