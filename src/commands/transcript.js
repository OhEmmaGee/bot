/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const { MessageEmbed } = require('discord.js');
const config = require('../../user/config');

module.exports = {
	name: 'transcript',
	description: 'Download a transcript',
	usage: '<ticket-id>',
	aliases: ['archive', 'download'],
	example: 'transcript 57',
	args: false,
	async execute(client, message, args, Ticket) {
		/** 
		 * @TODO TRY TO SEND ATTACHMENT TO DM
		 * @TODO ONLY ALLOW CREATOR AND STAFF TO RUN CMD
		 */
	}
};