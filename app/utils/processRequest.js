async function processRequest(ctx, userId, validChannels, channelsTitle, media) {
    try {
        for (let channelId of validChannels) {
            const member = await ctx.telegram.getChatMember(channelId, userId);
            if (member.status === 'left' || member.status === 'kicked') {
                const userInformation = await userInfo(ctx);
                const warningMessage = `
🔴 کاربر گرامی ${userInformation.fullName} ${userInformation.userName}
برای دریافت محتوا عضو کانال‌های زیر شوید 👇`;

                await ctx.reply(warningMessage, joinChannelButton(validChannels, channelsTitle));
                await checkUserMembership(ctx, userId, validChannels, channelsTitle, media);
                return; // Stop further processing if the user hasn't joined
            }
        }

        // If the user is already a member, send the media directly
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
        console.error('Error processing request:', err);
        ctx.reply('An error occurred while processing your request.');
    }
}

module.exports = processRequest;