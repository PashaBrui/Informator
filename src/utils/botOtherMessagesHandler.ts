
import { SearchSettings } from "./botCallbackHandler.js"
import { infoMess, yourSettings } from "./botMessages.js"
import { menuOptions, options } from "./botOptions.js"
import { filters, gpt } from "./botQueryFunctions.js"
import { saveChats } from "./saveChats.js"



export async function  
otherMessagesHandler(bot:any, settings: SearchSettings, chat_id: number, content?: string){
    let arr: string[] = []
    
    if(content?.includes('{')&&content.includes('}')){
      const regGetChatContent = /\{\}/g
      const topicWithColection = content?.replace(regGetChatContent,"")
      if(topicWithColection.includes('-')){
        arr = topicWithColection.split('-')
      }
      const topic =arr[0] || topicWithColection
      const chat = arr[1]
      const chats = chat?.split(',') || ["wroclaw"]
      await gpt(bot, chat_id, settings)
      
  
  } else if(content?.includes('#')){
    const reg = /\#\]\[/g
    const wordsWithColection = content?.replace( '#', "")
    console.log(wordsWithColection);
    if(wordsWithColection.includes('-')){
      arr = wordsWithColection.split('-')
    }
    const keyWords =(arr[0] || wordsWithColection).split(';').map((w:string)=>w.split(','));
    console.log(keyWords);
    const collection = arr[1]
      const collections = collection?.split(',') || ["Bialystok","po"]
     await filters(bot, chat_id, settings)
  
  }
  else if(content === 'Get'){
    await saveChats(bot, chat_id, ['minaTenerife'], 'Tenerife', 5).catch(console.error);
  }
  else if(content?.includes('Get')){
  const chats = content.split(' ')[1]?.split('/')
  const sity = content.split(' ')[2]
  const old = content.split(' ')[3]? content.split(' ')[3] as unknown as number : undefined
  if (!chats){ await bot.sendMessage(chat_id, "Chats not found in message!")} else {
  await saveChats(bot, chat_id, chats, sity || 'Random', old || 30).catch(console.error)};
}
  else{

   console.log(" else block no response")
   await bot.sendMessage(chat_id, "Soon you will be have here simply chat gpt for talking about anythings, but now i can do only search work", menuOptions.SettingsButton);
        await bot.sendMessage(
          chat_id,
          infoMess.settingsNow + yourSettings(settings),
          options.SearchType 
        );
  }
}