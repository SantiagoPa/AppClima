require('dotenv').config();
require('colors');
const { leerInput,
        inquirerMenu,
        pausa,
        listarLugares, } = require("./helpers/inquirer");
const Busquedas = require("./models/busqueda");


const main = async ()=>{
    
    const busqueda = new Busquedas();

    let opt;
    
    do {
        opt = await inquirerMenu();
        switch (opt) {
            case 1:
                //to show message
                const city = await leerInput('Ciudad: ');
                
                // buscar los lugares
                const places = await busqueda.ciudad( city );
                
                // seleccionar lugar
                const idSelect = await listarLugares(places);
                if (idSelect === '0') continue;

                const placeSelect = places.find(place => place.id === idSelect);

                busqueda.agregarHistorial(placeSelect.nombre);
                
                //Clima
                const climate = await busqueda.climatePlace(placeSelect.lat,placeSelect.lng);
                //mostrar resultados
                console.clear();
                console.log('\ninformacion de la ciudad\n'.green);
                console.log('Ciudad: ', placeSelect.nombre.green);
                console.log('Lat: ', placeSelect.lat);
                console.log('Lng: ',placeSelect.lng);
                console.log('Temperatura: ',climate.temp);
                console.log('Minima: ',climate.min);
                console.log('Maxima : ',climate.max);
                console.log('Como esta el clima: ',climate.desc.green);
            break;
        
            case 2:
                // to show message
                busqueda.historialCapitalizado.forEach( (place,i) =>{
                    const idx = `${i + 1}.`.green;
                    console.log(`${idx} ${place}`);
                });
                
            break;
        }
        if(opt !== 0) await pausa(); 
    } while (opt !== 0);
   
}

main();