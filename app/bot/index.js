const {Telegraf} = require('telegraf')
const LocalSession = require("telegraf-session-local")
const mongoose = require('mongoose')
const messages = require('../utils/messages')
const Media = require('../model/media')
const userInfo = require('../utils/userInfo')
const checkUserMembership = require('../utils/checkUserMembership')
const processRequest = require('../utils/processRequest')
const {joinChannelButton} = require('../Button')
const adminsChatId = [146460664, 1354048303]

startBot = async () => {
    const bot = new Telegraf(process.env.TOKEN)
    bot.use(new LocalSession({database: "session.json"}))
    bot.use((ctx, next) => {
        const message = ctx.message.text || 'false'
        // Check if the user ID is in the list of allowed admins
        if (adminsChatId.includes(ctx.chat.id) || message.includes('/start')) {
            return next(); // Proceed with the next middleware or command handler
        } else {
            // Reply with a message indicating that the user is not authorized
            return; // Stop further processing
        }
    });
    bot.start(async (ctx) => {
        const mediaID = ctx.payload;
        const userId = ctx.chat.id

        if (!mediaID) {
            return ctx.reply(messages.START_MESSAGE + '\n' + messages.START_BOT);
        }

        try {
            const media = await Media.findById(mediaID)

            if (!media) {
                return ctx.reply(messages.MEDIA_NOT_FOUND);
            }



            let channels = media.channel;

            const channelTitle = await Promise.all(
                channels.map(async channel => {
                    try {
                        const chat = await ctx.telegram.getChat(channel);
                        return chat.title;
                    } catch (err) {
                        return null;
                    }
                })
            );

            const channelsTitle = await channelTitle.filter(title => title !== null);
            const validChannels =await channels.filter((_, index) => channelTitle[index] !== null);

            for (let channelId of validChannels) {
                const member = await ctx.telegram.getChatMember(channelId, userId);
                if (member.status === 'left' || member.status === 'kicked') {
                    const userInformation = await userInfo(ctx);
                    const warningMessage = `
🔴 کاربر گرامی ${userInformation.fullName} ${userInformation.userName}
برای دریافت محتوا عضو کانال های زیر شوید 👇`;

                    await ctx.reply(warningMessage, joinChannelButton(validChannels, channelsTitle, media._id));
                    return;  // Stop further processing if the message is deleted
                }
            }

            // Send the media back to the user based on its type
            if (media.type === 'photo') {
                return ctx.replyWithPhoto(media.mediaID);
            } else if (media.type === 'video') {
                return ctx.replyWithVideo(media.mediaID);
            } else if (media.type === 'audio') {
                return ctx.replyWithAudio(media.mediaID);
            } else if (media.type === 'document') {
                return ctx.replyWithDocument(media.mediaID);
            }

        } catch (err) {
            console.error('Error fetching media:', err);
            ctx.reply('An error occurred while fetching the media.');
        }

    })
    bot.on('photo', async (ctx) => {
        await handleMedia(ctx, 'photo');
    });

    bot.on('video', async (ctx) => {
        await handleMedia(ctx, 'video');
    });

    bot.on('audio', async (ctx) => {
        await handleMedia(ctx, 'audio');
    });

    bot.on('document', async (ctx) => {
        await handleMedia(ctx, 'document');
    });

    bot.command('endData', async (ctx) => {
        ctx.session.getChannel = null
        ctx.reply('کانال های فرستاده شد برای این مستند ثبت شد')
        ctx.reply(ctx.session.link)
    })

    bot.on('text', async (ctx) => {
        let message = ctx.message.text
        const userId = ctx.from.id

        if (ctx.session.getChannel === 'getData') {
            ctx.reply(`لطفا آدرس کانال بعدی را وارد کنید: 
            
وقتی همه کانال هارو وارد کردی /endData رو بفرست`);
            const media = await Media.findById(ctx.session.fileId)
            if (message.charAt(0) !== '@') {
                message = '@' + message
            }
            media.channel.push(message)
            media.save()
        }
    })
    bot.launch()
}

async function handleMedia(ctx, type) {
    const userId = ctx.from.id
    let fileId;

    if (type === 'photo') {
        fileId = ctx.message.photo[0].file_id;
    } else if (type === 'video') {
        fileId = ctx.message.video.file_id;
    } else if (type === 'audio') {
        fileId = ctx.message.audio.file_id;
    } else if (type === 'document') {
        fileId = ctx.message.document.file_id;
    }

    const newMedia = new Media({
        mediaID: fileId,
        userId: userId,
        type: type,
    })

    const media = await Media.findOne({mediaID: fileId})
    if (!media) {
        const mediaId = await newMedia.save();
        ctx.session.getChannel = 'getData'
        const link = `https://t.me/${messages.BOT_USERNAME}?start=${mediaId._id}`;
        ctx.session.fileId = mediaId._id
        ctx.session.link = link
        ctx.reply(`لطفا آدرس کانال را وارد کنید: `);
    } else {
        media.channel = []
        await media.save()
        const link = `https://t.me/${messages.BOT_USERNAME}?start=${media._id}`;
        ctx.session.getChannel = 'getData'
        ctx.session.link = link
        ctx.reply(`لطفا آدرس کانال را وارد کنید: `);
    }

}

module.exports.startBot = startBot;