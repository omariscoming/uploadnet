const messages = require('./utils/messages')
const joinChannelButton = (data, titles, mediaId) => {
    const dynamicButtons = convertArrayToColumn(data, 1).map((item, index) =>
        item.map(subItem => ({
            text: titles[index],
            url: `https://t.me/${subItem.slice(1)}`
        }))
    );

    // Static button to add at the end
    const staticButton = [
        {
            text: "✅ عضو شدم", // Replace with your button text
            url: `https://t.me/${messages.BOT_USERNAME}?start=${mediaId}`  // Replace with your desired URL
        }
    ];

    return {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                ...dynamicButtons,
                staticButton // Append the static button
            ]
        },
    };
};


const convertArrayToColumn = (array,n) => {
    const symbolList = Object.values(array);
    let arr = []
    symbolList.forEach((item, index)=>{
        if (Math.floor(index/n) >= arr.length){
            const arr1 = []
            arr.push(arr1)
        }
        arr[arr.length - 1].push(item)
    })
    return arr;
}

module.exports = {
    joinChannelButton
}