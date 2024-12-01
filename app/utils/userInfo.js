const getUserInfo = (ctx) => {

    const firstName = ctx.message.from.first_name || ''
    const lastName = ctx.message.from.last_name || ''

    const fullName = firstName + ' ' + lastName

    const userName = ctx.message.from.username ? `@${ctx.message.from.username}` : ''

    const userId = ctx.message.from.id

    return{
        fullName,
        userName,
        userId
    }
}

module.exports = getUserInfo