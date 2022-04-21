const Discord = require('discord.js');
const mysqldump = require('mysqldump');
const cron = require('node-cron');
var findRemoveSync = require('find-remove');
var config = require('./config');
const client = new Discord.Client()
const cronjob = config.cron;
const servername = config.dc.servername;
const dbname = config.db.database;
const host = config.db.host;
const user = config.db.user;
const password = config.db.password;
const servericon = config.dc.servericon;
const command = config.dc.manual_command;
const activity = config.dc.bot_activity;
const backup_channel_id = config.dc.backup_channel_id;
const token = config.dc.bot_token;

client.once('ready', () => {
    client.user.setStatus('online');
    client.user.setActivity(`${activity.toString()}`);
    console.log(`${servername.toString()} | DB-Backup started succesfully`);
})

if (config.delete_backups) {
    cron.schedule(cronjob.toString(), () => {
        findRemoveSync(__dirname + '/backups', {age: {seconds: 604800}, extensions: ['.sql']});
    });
};

cron.schedule(cronjob.toString(), () => {
   createBackup(dbname.toString());
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
            host: host.toString(),
            user: user.toString(),
            password: password.toString(),
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
    embed.setTitle(`${servername.toString()} | Datenbank Backup`)
    embed.setTimestamp()
    embed.setFooter(servername.toString(), servericon.toString())
 
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
 
    backupchannel = client.channels.cache.get(backup_channel_id.toString());
    backupchannel.send(embed)
    delay(250).then(() => backupchannel.send({files:
        [file]})
    );
};

client.on('message', message => {
    if (message.channel.id !== config.dc.backup_channel_id) return;
    if (message.content.toLowerCase() === command.toString()) {
        let issuer = message.author.id
        createBackup(dbname.toString(), issuer)
        message.delete();
    }
})

client.login(token.toString())
