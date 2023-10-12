
import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';
import { MongOrb, getEnv } from '../utils/orm.js';

import { MongoClient} from 'mongodb';
import { openAIcreateChatCompletion } from '../utils/openAi.js';
import { log } from 'console';

export const handler = async (input: FieldResolveInput) => 
  resolverFor('TelegramQuery','getMessagesByTagsAndTopic',async (args) => { 
    console.log(args);
    const consDays = args.daysAgo || 30
    const keyWords:(string[] | null | undefined)[]|null|undefined = args.keyWords
    const date = new Date()
    if(consDays) date.setDate(date.getDate() - consDays)
    const chatNameRegexPatterns = args.chats?.map(name => new RegExp(name, "i"));
    const queries = keyWords?.map(group => { const regexPatterns = group?.map(keyword => new RegExp(keyword, "i"));
    return {"messages.text": { $all: regexPatterns}};});
    const client = new MongoClient(getEnv('MONGO_URL'), {  monitorCommands: true });
    const collections = await client.db('son_dev').listCollections().toArray();
     let messagesForGpt:any =[];

  for (const collec of collections) {
          const collectionName = collec.name;
          if(args.collections?.length && args.collections?.length !== 0 && !args.collections.some(element => collectionName.includes(element)))  continue
          const collection = collec?.name.length>2 ? collec.name : "Bialystok"
      
          const aggregationPipeline = [
            {
              $match: {
                name: {
                  $in: chatNameRegexPatterns 
                }
              }
            },
            {
              $unwind: "$messages"
            },
            {
              $set: {
                "messages.chat_id": "$id", 
                "messages.chat_name": "$name" 
              }
            },
            { $match: {
              $and: [
                { $or: queries }, 
                { "messages.date": { $gte: date.toISOString() } } 
                
              ]
            },
          },
            {
              $replaceRoot: {
                newRoot: "$messages"
              }
            },
            {
              $project: {
                "type": 1,
                "text": 1,            
                "from": 1,   
                "from_id": 1,         
                "date": 1,            
                "chat_name":1, 
                "chat_id":1,      
              }
            }
            
          ];
        const result = await MongOrb(collection)?.collection?.aggregate(aggregationPipeline).toArray();
        messagesForGpt = messagesForGpt.concat(result)
          console.log("iteracija!:",collection);   
            }
   if(messagesForGpt.length ===0) return []
   console.log(messagesForGpt?.slice(0, 3).map((mess: any)=>({ ...mess, text: Array.isArray(mess?.text) ? mess?.text?.toString() : mess?.text , from: mess.from || mess.from_id })));
   console.log(messagesForGpt?.length)  
      
   const response = await sendToOpenAi(messagesForGpt.slice(0, 30), args.topic[0])
   if(response?.length&&response?.length>1) await MongOrb('GPTResponseForTarget').createWithAutoFields('_id',
       'createdAt')({topic: args.topic, chats: args.chats, response});

  console.log (response.join(", \n"))
  return  response
    }
)(input.arguments);





async function sendToOpenAi(messages: any[], topic:string){
  const allContent = messages.map((message)=>{
    const {text, type} = message
    if (text.length>3 || Array.isArray(text)&&text.filter((mes)=>mes.length>3).length>0) return  Array.isArray(text)?  text.filter((mes)=>mes.length>3).join(', ') : `"${text}"`
    
  })

    const completion = await openAIcreateChatCompletion(getEnv('OPEN_AI_SECRET'), { messages: [{ role: "system", content: "Jestesz moim bardzo rozumnym pomocnikiem który poszukuje dla mnie informacji. Podam ci duży dialog - messages, gdzie ludzi piszą o różnych tematach. I podam temat - topic, który mnie interesuje, a ty zwracasz mnie tylko te messages, gdzie znalazłeś coś o mój temat. -Powinieneś przeczytać każdą wiadomość i spróbować zrozumieć jej temat.- Nie zwracaj dublicatów-Zwracaj mnie tylko array z json objektami {text: String}"}, {role: "user", content:`{ messages:'${allContent}', topic:'${topic}'}` }]});
      
    
    console.log(completion?.usage);
    
    console.log(completion?.choices[0]?.message);
    if(completion?.error?.message)  return [{text: completion?.error.message, from: "ERROR"}]
    
    

    const findedTexts: any[] = JSON.parse(completion?.choices[0]?.message.content);
    console.log(findedTexts[0].text)
    const cleanText = (text: any) => ((typeof text !== 'string') ? text?.toString() : text)?.toLowerCase().replace(/[^a-z\p{L}]/gu, '');
    console.log(cleanText(findedTexts[0].text))
    const returnMessages = messages.filter((mess) => {
      const cleanedMessageText = cleanText(mess.text);
      console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP")
      console.log(mess)
      console.log(cleanedMessageText)
      
      return findedTexts.some(keyword => cleanText(keyword.text) && cleanedMessageText.includes(cleanText(keyword.text)));
    });
    
    if(returnMessages.length === 0) return []
    console.log(returnMessages?.slice(0, 3).map((mess: any)=>({ ...mess, text: Array.isArray(mess?.text) ? mess?.text?.toString() : mess?.text , from: mess.from || mess.from_id })));
    console.log(returnMessages?.length)   
    return returnMessages?.slice(0, 1001).map((mess: any)=>({ ...mess, text: Array.isArray(mess?.text) ? mess?.text?.toString() : mess?.text || " ", from: mess.from || mess.from_id }))
  }