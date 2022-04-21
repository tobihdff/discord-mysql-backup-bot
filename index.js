const Discord = require('discord.js');
const mysqldump = require('mysqldump');
const cron = require('node-cron');
var findRemoveSync = require('find-remove');
var config = require('./config');
const client = new Discord.Client()


client.once('ready', () => {
    client.user.setStatus('online');
    client.user.setActivity(`${config.dc.bot_activity}`);
    console.log(`${config.dc.servername} | DB-Backup started succesfully`);
})

if (config.delete_backups) {
    cron.schedule(config.cron, () => {
        findRemoveSync(__dirname + '/backups', {age: {seconds: 604800}, extensions: ['.sql']});
    });
}

cron.schedule(config.cron, function() {
   createBackup(config.db.database);
});

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
};
 
function createBackup(database, user) {
    const date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let currentDate = (date + "_" + month + "_" + year + "_" + hours + "_" + minutes + "_" + seconds);
    let file = __dirname + '/backups/' + database + '-' + currentDate + '.sql';
    let filename = database + '-' + currentDate + '.sql';
 
    mysqldump({
             
        connection: {
            host: config.db.host,
            user: config.db.user,
            password: config.db.password,
            database: database
        },
        dumpToFile: file,
        compressFile: false,
 
    })
    delay(1500).then(() => sendToDiscord(database, file, filename, user));
};
 
function sendToDiscord(database, file, filename, user) {
    let embed = new Discord.MessageEmbed()
    embed.setColor('#58BAFF')
    embed.setTitle(`${config.dc.servername} | Datenbank Backup`)
    embed.setTimestamp()
    embed.setFooter(config.dc.servername, config.dc.servericon)
 
    if (user) {
        embed.addFields(
            { name: 'Dateiname:', value: "`" + filename + "`" },
            { name: 'Datenbank:', value: database },
            { name: 'Erstellt von', value: '<@' + user + '>' },
         )
    } else {
        embed.addFields(
            { name: 'Dateiname:', value: "`" + filename + "`" },
            { name: 'Datenbank:', value: database },
            { name: 'Erstellt von', value: 'System' },
        )
    };
 
    backupchannel = client.channels.cache.get(config.dc.backup_channel_id);
    backupchannel.send(embed)
    delay(250).then(() => backupchannel.send({files:
        [file]})
    );
};

client.on('message', message => {
    if (message.channel.id !== config.dc.backup_channel_id) return;
    if (message.content.toLowerCase() === config.dc.manual_command) {
        let issuer = message.author.id
        createBackup(config.db.database, issuer)
        message.delete();
    }
})

client.login(config.dc.bot_token)