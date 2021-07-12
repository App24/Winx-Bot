export class UserLevel{
    public userId : string;
    public level : number;
    public xp : number;

    public constructor(id : string){
        this.userId=id;
        this.level=0;
        this.xp=0;
    }
}