import express from 'express';
import { createClient } from 'redis';
import 'dotenv/config'

const app = express();
const PORT = 3000;

app.use(express.json());

const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
await client.connect();

app.get("/", (req, res) => {

});

app.post("/", async (req, res) => {
    const location = req.body.city;
    const weatherData = await client.get(location);

    if(weatherData == null) {
        const apiReq = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${process.env.API_KEY}`);
        const apiResult = await apiReq.json();

        if(apiResult) {
            const newData = {address: apiResult.address, description: apiResult.description, temp: apiResult.currentConditions.temp};
            console.log("Coming from api");
            res.json({success: true, data: newData});
            await client.set(location, JSON.stringify(newData), { EX: 3600 });
        }
        else {
            res.json({success: false, message: "Error! Please enter a valid address"});
        }
    }
    else {
        res.json({success: true, data: weatherData});
    }
})

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});