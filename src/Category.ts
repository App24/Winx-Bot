const Categories : Category[]=[];

class Category{
    public name : string;
    public emoji : string;
    public categoryEnum : CategoryEnum;
    public hidden : boolean;

    public constructor(name : string, emoji : string, catEnum : CategoryEnum, hidden : boolean=false){
        this.name=name;
        this.emoji=emoji;
        this.categoryEnum=catEnum;
        this.hidden=hidden;
        Categories.push(this);
    }
}

enum CategoryEnum{
    Settings, Owner,
    Characters, Rank,
    Info, Custom,
    Patreon, Other
}

const Settings=new Category("Settings", ":gear:", CategoryEnum.Settings, true);
const Owner=new Category("Owner", ":crown:", CategoryEnum.Owner, true);
const Characters=new Category("Characters", ":person_curly_hair:", CategoryEnum.Characters);
const Rank=new Category("Rankings", ":1234:", CategoryEnum.Rank);
const Info=new Category("Info", ":question:", CategoryEnum.Info);
const Custom=new Category("Customisation", ":wrench:", CategoryEnum.Custom);
const Patreon=new Category("Patreon", ":coin:", CategoryEnum.Patreon, true);
const Other=new Category("Other", ":recycle:", CategoryEnum.Other);

export {Category, Settings, Owner, Characters, Rank, Info, Custom, Patreon, Other, Categories};