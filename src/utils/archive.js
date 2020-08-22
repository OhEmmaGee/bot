/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const lineReader = require('line-reader');
const fs = require('fs');
const dtf = require('@eartharoid/dtf');
const config = require('../../user/config');

module.exports.add = (client, message) => {

	if(message.type !== 'DEFAULT') return;

	if (config.transcripts.text.enabled) { // text transcripts
		let path = `user/transcripts/text/${message.channel.id}.txt`,
			time = dtf('HH:mm:ss n_D MMM YY', message.createdAt),
			msg = message.cleanContent;
		message.attachments.each(a => msg += '\n' + a.url);
		let string = `[${time}] [${message.author.tag}] :> ${msg}`;
		fs.appendFileSync(path, string + '\n');
	}

	if (config.transcripts.web.enabled) { // web archives
		let raw = `user/transcripts/raw/${message.channel.id}.log`,
			json = `user/transcripts/raw/entities/${message.channel.id}.json`;

		let embeds = [];
		for (let embed in message.embeds)
			embeds.push(message.embeds[embed].toJSON());

		// message
		fs.appendFileSync(raw, JSON.stringify({
			id: message.id,
			author: message.author.id,
			content: message.content, // do not use cleanContent!
			time: message.createdTimestamp,
			embeds: embeds,
			attachments: [...message.attachments.values()]
		}) + '\n');

		// channel entities
		if (!fs.existsSync(json))
			fs.writeFileSync(json, JSON.stringify({
				channel_name: message.channel.name,
				entities: {
					users: {},
					channels: {},
					roles: {}
				}
			})); // create new

		let data = JSON.parse(fs.readFileSync(json));

		if (!data.entities.users[message.author.id]) {
			data.entities.users[message.author.id] = {
				avatar: message.author.avatarURL(),
				username: message.author.username,
				discriminator: message.author.discriminator,
				displayName: message.member.displayName,
				color: message.member.displayColor,
				badge: message.author.bot ? 'bot' : null
			};
		}

		message.mentions.channels.each(c => data.entities.channels[c.id] = {
			name: c.name
		});

		message.mentions.roles.each(r => data.entities.roles[r.id] = {
			name: r.name,
			color: r.color
		});

		fs.writeFileSync(json, JSON.stringify(data));

	}
};

module.exports.export = (client, channel) => new Promise((resolve, reject) => {	

	let raw = `user/transcripts/raw/${channel.id}.log`,
		json = `user/transcripts/raw/entities/${channel.id}.json`;

	if (!config.transcripts.web.enabled || !fs.existsSync(raw) || !fs.existsSync(json))
		return reject(false);
		
	let data = JSON.parse(fs.readFileSync(json));
	
	data.messages = [];

	lineReader.eachLine(raw, line => {
		let message = JSON.parse(line);
		// data.messages[message.id] = message;
		let index = data.messages.findIndex(m => m.id === message.id);

		if (index === -1)
			data.messages.push(message);
		else
			data.messages[index] = message;
	}, () => {
		// fs.writeFileSync('user/data.json', JSON.stringify(data)); // FOR TESTING
		// post(data).then()
		resolve(config.transcripts.web.server); // json.url
	});	
});
