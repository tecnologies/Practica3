db=require('./myModule')
var DB=new myDB('./data')

var util = require('util'),
    twitter = require('twitter');
var twit = new twitter({
    consumer_key: 'GRzuAZHSQbMKNMWKQXKTbSWN2',
    consumer_secret: 'Qa5sKJJBtqCU6vPnjQr8LJdlTVUopDtrphfl55zOpEiKWYcV0j',
    access_token_key: '3065985165-wOqbYr0PtIMY2P9UHBPBDkY48zBdHNWnlhsZQOc',
    access_token_secret: 'mnbMY9iOAi25N0UYz54GPwAsuVga3ppVSwB4APq91Ufp5'
});

DB.getPalabrasDataset();
DB.getTweetFicheros();

function guardarTweet(query,DB){
    if( DB.getDatasetCreated(query,DB)){
        twit.get('search/tweets.json',
        {q:query},
        function(error,data,status){
        //insert data into the DB
            var x;
            for(x in data){
                 for(j in data[x]){
                    DB.insertObject(query,{id: data[x][j].id, text : data[x][j].text, coordinates : data[x][j].coordinates});
                    
                 }
                 break;
            }
        });
    }else{
        console.log("ERROR! el fichero no existe o no se ha podido crear");
    }
}

function infoData(name, DB){
  DB.getDatasetInfo(name,function(data){
    console.log("Info dataset ="+data['result']);
   });
}


function buscarData (name, DB){
	var result = DB.searchDataset(name);	
	console.log("resultado ="+result);
}

function contarPalabras(name, DB){
    DB.countWords(name, function(data){
    	console.log("Numero de palabras total fichero ="+data['result']);
    });
}

function contarVecesPalabras(name, DB){
    DB.nVecesPalabra(name, function(data){
    	   console.log(JSON.stringify(data));
    		for(x in data['result']){
              console.log(x+" y su numero de palabras="+data['result'][x]);
    		}
        });
}

function polaridad(name, DB){
    DB.getPolaridad(name, function(data){
    	console.log("POLARIDAD POSITIVA="+data['positiva']+" ----- NEGATIVA="+data['negativa']);
    });
}

function prueba(){
	DB.getPalabrasDataset();	
}

function prueba2(){
	DB.getNword("messi",20, function(data){
		console.log(data);
	});	
}


//infoData ('camiones', DB);
//buscarData ('camiones', DB);
//guardarTweet('messi', DB);
//contarPalabras ('messi', DB);
//contarVecesPalabras ('messi', DB);
//polaridad ('messi', DB);
//prueba();
//console.log(DB.vecesPalabras);

prueba2();





