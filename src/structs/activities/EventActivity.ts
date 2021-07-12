import { Activity } from "./Activity";

export abstract class EventActivity extends Activity{
    private startTime:Date;
    private endTime:Date;

    public constructor(startTime:Date, endTime:Date){
        super();
        this.startTime=startTime;
        this.endTime=endTime;
        this.startTime.setFullYear(new Date().getFullYear());
        this.endTime.setFullYear(new Date().getFullYear());
    }

    public canRun() : boolean{
        const currentDate=new Date();
        currentDate.setHours(0,0,0,0);
        if(currentDate>=this.startTime&&currentDate<=this.endTime){
            return true;
        }
        return false;
    }
}