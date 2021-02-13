
const fs = require('fs');
const axios = require('axios');

class Busquedas{

    historial = [];
    dbPath = './db/database.json';
    constructor(){
        this.readDB();
    }

    get historialCapitalizado(){
        // historial Capitalizado
        return this.historial.map( place =>{
            let word = place.split(' ');
            word = word.map( w => w[0].toUpperCase() + w.substring(1) );

            return word.join(' ');
        });
    }
    get paramsMapbox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language':'es'
        }
    }

    async ciudad(lugar='') {
        //peticion http
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            });

            const res = await instance.get();
            
            return res.data.features.map(lugar => ({
                
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]

            }));    
        } catch (error) {
            
            return [];

        }
        
    }

    get paramsClimate(){
        return{
            units: 'metric',
            lang: 'es'
        }
    }
    async climatePlace (lat, lon) {

        try {
            const instance = axios.create({

                baseURL: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_KEY}`,
                params: this.paramsClimate

            });

            const res = await instance.get();
            
            const {weather,main}  = res.data;
        
            return{
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        } catch (error) {
            console.log('Ha sucedio un error',error);
        }
    }

    agregarHistorial( lugar = '' ){
        // TODO: prevenir duplicidad
        if (this.historial.includes(lugar.toLowerCase())) {
            return;
        }

        this.historial = this.historial.splice(0,5);

        this.historial.unshift(lugar.toLowerCase());

        //Grabar en db
        this.saveDB(); 
    }

    saveDB(){

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath , JSON.stringify(payload));

    }

    readDB(){
        
        // debe existir...
        if (!fs.existsSync(this.dbPath)) return;

        const info = fs.readFileSync(this.dbPath , {encoding: 'utf-8'});
        
        const data = JSON.parse(info);
        
        this.historial = data.historial;
    }
}

module.exports = Busquedas;