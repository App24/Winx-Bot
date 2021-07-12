export abstract class Activity {
    public abstract getActivity() : string | Promise<string>;

    public canRun() : boolean{
        return true;
    }
}