async function checkUserMembership(ctx, userId, validChannels, channelsTitle, media, retryCount = 5) {
    for (let i = 0; i < retryCount; i++) {
        let allJoined = true;

        for (let channelId of validChannels) {
            const member = await ctx.telegram.getChatMember(channelId, userId);
            if (member.status === 'left' || member.status === 'kicked') {
                allJoined = false;
                break;
            }
        }

        if (allJoined) {
            await ctx.reply('✅ شما به کانال‌های موردنظر عضو شده‌اید. اکنون می‌توانید محتوای درخواست‌شده را دریافت کنید.');

            // Send the media to the user
            if (media.type === 'photo') {
                return ctx.replyWithPhoto(media.mediaID);
            } else if (media.type === 'video') {
                return ctx.replyWithVideo(media.mediaID);
            } else if (media.type === 'audio') {
                return ctx.replyWithAudio(media.mediaID);
            } else if (media.type === 'document') {
                return ctx.replyWithDocument(media.mediaID);
            }
            return; // Exit the function after sending media
        }

        // Wait before the next retry
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    }
}

module.exports = checkUserMembership;