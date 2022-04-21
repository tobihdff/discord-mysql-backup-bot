
# MySQL Backup Bot

This script can send a backup of your mysql database to your discord either on command or after fixed times.
## Installation

```bash
  git clone https://github.com/chrinxcoding/discord-mysql-backup-bot.git
  cd discord-mysql-backup-bot
  npm i
  node index.js
```

## Config

| Variable  | Description                |
| :-------- | :------------------------- |
| `cronjob` | https://www.bennetrichter.de/tools/crontab-generator/ (default is one every hour)
| `delete_backups` | delete backups older than 7 days from server (default is true)
| `host` | ip address of your mysql server
| `username` | username of your mysql user
| `database` | name of your mysql database
| `password` | password of your mysql user
| `token` | discord bot token
| `command` | command to run backup manually (default is .gen)
| `channelid` | channel id of the channel where the backup should be send
| `servername` | name of your server
| `servericon` | icon of your server
| `bot_activity` | discord bot activity
    
## Screenshots

![Screenshot](https://i.imgur.com/h3gei1o.png)

