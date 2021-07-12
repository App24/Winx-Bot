export class RankLevel{
    public level : number;
    public roleId : string;
    public gifs : string[];

    public constructor(level : number, roleId : string){
        this.level=level;
        this.roleId=roleId;
        this.gifs=[];
    }
}