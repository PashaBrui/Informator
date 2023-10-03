import TelegramBot from 'node-telegram-bot-api';
import {filters, gpt } from './utils/bots.js';
const FinderByChats='6659125986:AAGcWZCUcBhJknQNmK_2InwjwOQo6-h9S7Y'

const bot = new TelegramBot(FinderByChats, { polling: true });

let infoMess = {}
let userSettings = {};



const optionsSearchType = {
  reply_markup: {
    inline_keyboard: [[{text:'GPT search', callback_data: 'GPT search'} , {text:'Filters', callback_data:'Filters' }, {text:'Filters + GPT', callback_data:'Filters + GPT' }]],
    force_reply: true,
    resize_keyboard: true,
    one_time_keyboard: true
  },
};

const optionsSearch = {
  reply_markup:  {
    inline_keyboard: [[{text :'Add KeyWords and run🚀', callback_data:'KeyWords'}]],
    resize_keyboard: true,
    one_time_keyboard: true
  },
}

const optionsSearchGPT = {
  reply_markup:  {
    inline_keyboard: [[{text :'Enter topic or description and run🚀', callback_data:'Topic'}]],
    resize_keyboard: true,
    one_time_keyboard: true
  },
}
 export const optionsSearch2 ={
    reply_markup:  {
    keyboard: [[ 'Settings']],
    resize_keyboard: true,
  }}

const optionsSearchSettings = {
  reply_markup: {
    keyboard: [['ChatNamesFilter', 'DaysAgo', 'SearchType', 'LimitReturnedMessages']],
    resize_keyboard: true,
  },
};

const optionsInputDaysAgo = {
  reply_markup: {
    force_reply: true, 
    keyboard: [['1 day', '3 days', '7 days'], ['30 days', 'Other']],
    resize_keyboard: true,
  },
};

const optionsNumberMessages = {
  reply_markup: {
    force_reply: true, 
    inline_keyboard: [[{text :'3',  callback_data: 'button_3' }, {text :'5',  callback_data: 'button_5' }, {text :'10',  callback_data: 'button_10' }],[{text :'20',  callback_data: 'button_20' }, {text :'Other',  callback_data: 'button_other',  color: 'blue'}]], 
    resize_keyboard: true,
    one_time_keyboard: true
  },
};

const optionsInputValue = {
  reply_markup: {
    force_reply: true,
    resize_keyboard: true,
  },
};

const optionsInputChats = {
  reply_markup: {
    force_reply: true, 
    resize_keyboard: true,
  },
};

const optionsInputSities = {
  reply_markup: {
    force_reply: true, 
    resize_keyboard: true,
  },
};




bot.on('message', async (msg) => {
  const id = msg.message_id;
  const chat_name = msg.chat.title;
  const chat_id = msg.chat.id;
  const from = msg.from?.username  || msg.from?.first_name +"_"+ msg.from?.last_name
  const from_id = msg.from?.id
  const content = msg.text;
  const date = new Date(msg.date * 1000); 
  console.log("For FINDER! from: ", from, ", chat_id: ", chat_id, ", text: ", content)
  
 // if(content?.length&&content?.length>1) MongOrb('GPT4Listener').collection.updateOne({_id: chat_id},{ $set: {chatName: chat_name} , $push: {messages:{message_id,message_thread_id,reply_to_message_id, sender_name,sender, content,time }}},  { upsert: true });
 switch (content) {
  case '/start':
    await bot.sendMessage(chat_id, ' *Welcome to Messages Search Bot!* 🌟', { parse_mode: 'Markdown' });
    infoMess.startTypeSearch='🚀 For starting choose type search:'
    bot.sendMessage(chat_id, infoMess.startTypeSearch , optionsSearchType);
    userSettings[chat_id] = {}
    break;

  case 'Settings' :
    bot.sendMessage(chat_id, 'Choose an option:', optionsSearchSettings);
    break;

  case 'Back':
    bot.sendMessage(chat_id, 'Choose an option:', optionsSearch);
    break;

  case 'Input':
    bot.sendMessage(chat_id, "Your parameters:", optionsSearch2 );
    bot.sendMessage(chat_id, 'Add filter:', optionsSearch );
    break;

  case 'SearchType':
    infoMess.searchType='Choose type search:'
    bot.sendMessage(chat_id, infoMess.searchType , optionsSearchType);
    break;

  case 'DaysAgo':
    console.log(" 'DaysAgo'!!!");
    infoMess.maxOldMessages = `Choose max old messages for search:`
    bot.sendMessage(chat_id, infoMess.maxOldMessages , optionsInputDaysAgo);
   break

  case 'LimitReturnedMessages':
    console.log("LimitReturnedMessages!!!!");
    infoMess.maxReturnMess='Choose max number returned messages for one response:'
    bot.sendMessage(chat_id, infoMess.maxReturnMess , optionsNumberMessages)
    break

  case 'ChatNamesFilter':
      infoMess.chatNames = `Enter ${content} or fragments (separated by '/'):`
        bot.sendMessage(chat_id, infoMess.chatNames , optionsInputChats);
     break
  
  

    case '1 day':
    case '3 days':
    case '7 days':
    case '30 days':
      userSettings[chat_id].daysAgo = content?.split(" ")[0] ;
      await bot.sendMessage(chat_id, "Your settings:", optionsSearch2 )
      await bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id]), optionsSearch)
      break;
      
     
    // case 'GPT search':
    // case 'Filters + GPT':
    // case 'Filters' :
    //   console.log();
    //   userSettings[chat_id].searchType = content;
    //   bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id]), optionsSearch)
    //   break;

    case 'RUN SEARCH':
    const settings = userSettings[chat_id];
    const searchQuery = JSON.stringify(settings);
    console.log(searchQuery);
    if(!userSettings[chat_id]?.keyWords) bot.sendMessage(chat_id, `KeyWords is required!`);
    await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery}`);
    await filters(chat_id, userSettings[chat_id]?.keyWords, userSettings[chat_id]?.sities, userSettings[chat_id]?.chats,userSettings[chat_id]?.daysAgo,userSettings[chat_id]?.limitMessages )
    await bot.sendMessage(chat_id, "Repeat? You can to change configuration", optionsSearch2 );
    await bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id]), optionsSearch)
    break;

  default:
    // Handle other messages if needed
    console.log(msg)
    if (msg.reply_to_message){
  if ( msg.reply_to_message.text === infoMess.maxReturnMess)  userSettings[chat_id].limitMessages = msg.text; 
  if ( msg.reply_to_message.text === infoMess.writeKeyWords){
    userSettings[chat_id].keyWords = msg.text.split('/').filter((k)=>k !=="").map((w)=>w.split('&'));
    const settings = userSettings[chat_id];
    const searchQuery = JSON.stringify(settings);
    console.log(searchQuery);
    await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery}`);
    await filters(bot, chat_id, userSettings[chat_id]?.keyWords, userSettings[chat_id]?.sities, userSettings[chat_id]?.chats,userSettings[chat_id]?.daysAgo,userSettings[chat_id]?.limitMessages )
    await bot.sendMessage(chat_id, "You can enter other keyWords or change settings", optionsSearch );
    //await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
    break
  }

  if ( msg.reply_to_message.text === infoMess.writeTopic){
    userSettings[chat_id].topic = msg.text.split('/');
    const settings = userSettings[chat_id];
    const searchQuery = JSON.stringify(settings);
    console.log(searchQuery);
    await bot.sendMessage(chat_id, `Searching with settings: ${searchQuery}`);
    await gpt(bot, chat_id, userSettings[chat_id]?.topic, userSettings[chat_id]?.sities, userSettings[chat_id]?.chats,userSettings[chat_id]?.daysAgo,userSettings[chat_id]?.limitMessages )
    await bot.sendMessage(chat_id, "You can enter other topic or change settings", optionsSearchGPT);
   // await bot.sendMessage(chat_id, 'Or you can simply quickly write key words start with symbol #', optionsSearch2)
    break
  }
  if ( msg.reply_to_message.text === infoMess.chatNames) userSettings[chat_id].chats = msg.text.split('/')
  if ( msg.reply_to_message.text === infoMess.sities) userSettings[chat_id].sities = msg.text.split('/')
  await bot.sendMessage(chat_id, "Success!", optionsSearch2 );
  await bot.sendMessage(chat_id,  "Your settings:\n"+JSON.stringify(userSettings[chat_id])?.replace('/{}/', '') ,userSettings[chat_id].searchType === 'Filters' ? optionsSearch : optionsSearchGPT);
  break
    }
  bot.sendMessage(chat_id, ".......")
 
  
  let arr = []
  
  if(content?.includes('{')&&content.includes('}')){
    const regGetChatContent = /\{\}/g
    const topicWithColection = content?.replace(regGetChatContent,"")
    if(topicWithColection.includes('-')){
      arr = topicWithColection.split('-')
    }
    const topic =arr[0] || topicWithColection
    const collection = arr[1]
    const collections = collection?.split(',') || ["wroclaw"]
    await gpt(chat_id, topic, collections)
    

} else if(content?.includes('#')){
  const reg = /\#\]\[/g
  const wordsWithColection = content?.replace( '#', "", 1)
  console.log(wordsWithColection);
  if(wordsWithColection.includes('-')){
    arr = wordsWithColection.split('-')
  }
  const keyWords =(arr[0] || wordsWithColection).split(';').map((w)=>w.split(','));
  console.log(keyWords);
  const collection = arr[1]
    const collections = collection?.split(',') || ["Bialystok","po"]
   await filters(chat_id, keyWords, collections)

}else{
 console.log(" else block no response")
}
break;
}


});


bot.on('callback_query', async (callback) => {
  console.log(callback.message)
  const chat_id = callback.message?.chat?.id
  const content = callback.data
  switch (content) {
    case 'KeyWords':
          infoMess.writeKeyWords= `*Enter keywords or fragments\n (for variants use '/', for combinations use '&')*\n For example if you write: 'Warszawa&Bialystok/warshaw&tomorrow' >\n you get messages include the full fragments of "warszawa" and "bialystok" + all messages with the fragment warszaw and the word tomorrow in one text):`;
            bot.sendMessage(chat_id, infoMess.writeKeyWords, optionsInputValue)//, { parse_mode: 'Markdown' });
         break

    case 'Topic':
          infoMess.writeTopic= `*Enter only topic or full description for your query*:` ;
            bot.sendMessage(chat_id, infoMess.writeTopic, optionsInputValue)//, { parse_mode: 'Markdown' });
         break
      
      
    
    case 'Sities':
          infoMess.sities = `Enter ${content}:`
            bot.sendMessage(chat_id, infoMess.sities , optionsInputSities);
         break

    case 'GPT search':
    case 'Filters + GPT':
      userSettings[chat_id].searchType = content;
      userSettings[chat_id].limitMessages = userSettings[chat_id].limitMessages || 5;
      userSettings[chat_id].daysAgo = userSettings[chat_id].daysAgo || 30;
      delete userSettings[chat_id].keyWords;
     await bot.sendMessage(chat_id, "Let's go! Your settings now:\n " + JSON.stringify(userSettings[chat_id]), optionsSearch2 );
      bot.sendMessage(chat_id,'You can change the settings or go to enter your topic and run search: ', optionsSearchGPT)
      break;
    case 'Filters' :
      userSettings[chat_id].searchType = content;
      userSettings[chat_id].limitMessages = userSettings[chat_id].limitMessages || 5;
      userSettings[chat_id].daysAgo = userSettings[chat_id].daysAgo || 30;
     await bot.sendMessage(chat_id, "Let's go! Your settings now:\n " + JSON.stringify(userSettings[chat_id]), optionsSearch2 );
      bot.sendMessage(chat_id,'You can change the settings or go to enter keywords and run search: ', optionsSearch)
      break;
      
      
      

    default:
  userSettings[chat_id].limitMessages = callback.data?.replace("button_","") ; 
 await bot.sendMessage(chat_id, "Your parameters:", optionsSearch2 );
  bot.sendMessage(chat_id, JSON.stringify(userSettings[chat_id]), optionsSearch);
  }


}
)


bot.on('polling_error', (error) => {
    console.log(`Polling error: ${error.body}`);
  });





  //bot.sendMessage(878727057, "Hello my friend. I am worker from my boss Pasha Brui! I wish for you good day!")
 // bot.sendMessage(chat_id, "I'm sorry! This bot is in the process of being updated. Try again later. ");





 