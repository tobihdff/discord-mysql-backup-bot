const Discord = require('discord.js');
const mysqldump = require('mysqldump');
const cron = require('node-cron');
var findRemoveSync = require('find-remove');
const config = require('config');
const client = new Discord.Client()
const cronjob = config.get('general.cronjob');
const servername = config.get('discord.servername');
const dbname = config.get('mysql.database');
const host = config.get('mysql.host');
const username = config.get('mysql.username');
const password = config.get('mysql.password');
const servericon = config.get('discord.servericon');
const command = config.get('discord.command');
const activity = config.get('discord.bot_activity');
const backup_channel_id = config.get('discord.channelid');
const token = config.get('discord.token');
const delete_backups = config.get('general.delete_backups');

client.once('ready', () => {
    client.user.setStatus('online');
    client.user.setActivity(`${activity}`);
    console.log(`${servername} | DB-Backup started succesfully`);
})

if (delete_backups) {
    cron.schedule(cronjob, () => {
        findRemoveSync(__dirname + '/backups', {age: {seconds: 604800}, extensions: ['.sql']});
    });
};

cron.schedule(cronjob, () => {
   createBackup(dbname);
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
            host: host,
            user: username,
            password: password,
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
    embed.setTitle(`${servername} | Datenbank Backup`)
    embed.setTimestamp()
    embed.setFooter(servername, servericon)
 
    if (user) {
        embed.addFields(
            { name: 'Dateiname', value: "`" + filename + "`" },
            { name: 'Datenbank', value: database },
            { name: 'Erstellt von', value: '<@' + user + '>' },
         )
    } else {
        embed.addFields(
            { name: 'Dateiname', value: "`" + filename + "`" },
            { name: 'Datenbank', value: database },
            { name: 'Erstellt von', value: 'System' },
        )
    };
 
    backupchannel = client.channels.cache.get(backup_channel_id);
    backupchannel.send(embed)
    delay(250).then(() => backupchannel.send({files:
        [file]})
    );
};

client.on('message', message => {
    if (message.channel.id !== backup_channel_id) return;
    if (message.content.toLowerCase() === command) {
        let issuer = message.author.id
        createBackup(dbname, issuer)
        message.delete();
    }
})

client.login(token)
