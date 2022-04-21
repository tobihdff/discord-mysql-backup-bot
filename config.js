var config = {};

config.dc = {};
config.db = {};


config.cron = '0 * * * *'; // https://crontab-generator.org default is every hour

config.delete_backups = true; // delete backups older than 7 days from backups folder

config.dc.bot_token = ''; // bot token from discord developer page
config.dc.backup_channel_id = ''; // id of the channel were the backup will be send
config.dc.manual_command = '.gen'; // command to create a backup manually
config.dc.servername = ''; // name of your server
config.dc.servericon = ''; // icon of your server
config.dc.bot_activity = ''; // activity of the bot


config.db.host = ''; // database host
config.db.user = ''; // database user
config.db.password = ''; // user password
config.db.database = ''; // database name