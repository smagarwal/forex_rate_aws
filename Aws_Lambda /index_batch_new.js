import axios from "axios";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv'

dotenv.config(); 

const client = new DynamoDBClient({region: 'us-east-2'});
const docClient = DynamoDBDocumentClient.from(client);

const currency_pair_f_t = [["USD", "CNY"], ["USD", "INR"], ["EUR", "JPY"], ["EUR", "USD"]];

const api_call = async(currency_pair) =>{

    try {

        var url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${currency_pair[0]}&to_currency=${currency_pair[1]}&apikey=${process.env.API_KEY}`;

        const res= await axios.get(url,{ 
            headers: {'User-Agent': 'request'}
        })

        if (res.status !== 200) {

          return res.status;

        } else {
            // data is successfully parsed as a JSON object:

            const time_stamp = res.data["Realtime Currency Exchange Rate"][ "6. Last Refreshed"];
            const date_time = time_stamp.split(" ");
            const currency_from_to =  res.data["Realtime Currency Exchange Rate"][ "1. From_Currency Code"] + "/" + res.data["Realtime Currency Exchange Rate"][ "3. To_Currency Code"];
            const exchange_rate = res.data["Realtime Currency Exchange Rate"][ "5. Exchange Rate"];

            const exch_info = {
                
                currency_pair: currency_from_to,
                my_s_key: currency_from_to + '_' + date_time[1], //sort_key
                my_date: date_time[0],
                my_time:  date_time[1],
                exchange_rate: exchange_rate

            }

            return {exch_info}; 

        }

    }catch (err){
        return err; 
    }
}

export const handler  = async (event)=>{

    try {

        const promise_results = await Promise.allSettled(currency_pair_f_t.map((currency_pair)=> {

            return api_call(currency_pair);

        }));

        const curr_info = [];
        
        promise_results.forEach((result)=>{

            if(result.status === "fulfilled"){
                if(result.value.exch_info){

                    curr_info.push(result.value.exch_info);

                }else {
                    console.log(result.value);  // if not 200 
                }

            }else {

                console.log(result.reason);

            }
        });


        const putRequests = curr_info.map((info)=>{

            return {
                PutRequest: {
                  Item: info
                }
            }

        })

        if(putRequests.length > 0){

            const command = new BatchWriteCommand({
                RequestItems: {
                  
                  ["my_forex_table"]: putRequests
                },
            });
    
            const response = await docClient.send(command);
            console.log(response);
            return response;

        }

        return "All requests to API failed"; // if all are bad requests 

    } catch(err){
        console.log('Error:', err);
    }

}