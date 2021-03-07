const Command=require("../../Command");

class Roles extends Command{
    constructor(){
        super("roles");
        this.ownerOnly=true;
        this.deprecated=true;
        this.category=Command.OwnerCategory;
    }

    onRun(bot, message, args){
        const data=[];
        message.guild.roles.cache.forEach(role => {
            data.push(`${role}: ${role.id}`);
        });

        message.channel.send(data);
    }
}

module.exports=Roles;