var gb=require('glob');
var fs=require('fs');
var split=require('split');
var sf=require('slice-file');



myDB = function(dataDir){
        this.dataDir=dataDir+"/";
        this.datasets=[];
        this.lastID=0;
        this.inspectDatasets();
        this.polarities={};
        this.loadPolarities();
        this.numeroTweets={};
        this.vecesPalabras={};
        this.cabeceras=[];
}

//Cargamos la polaridad de las palabras
myDB.prototype.loadPolarities = function(){
	  var DB = this;
      var polaridad = fs.createReadStream("polaridades.txt");
      polaridad.pipe(split())
      .on('data', function(linea){
	       var elemento = linea.split("\t");
	       DB.polarities[elemento[0]] = elemento[1];
      });
}


//Cuenta el numero de lineas de un dataset
myDB.prototype.getLineas = function(name,callback){
    var readStream = fs.createReadStream("./data/"+name+".json");
    var lineas = 0;
    readStream.pipe(split())
        .on('data', function(){
            lineas++;
        })
        .on('end',function(){
            lineas--;
            callback({lineas:lineas,name:name});
        })
}

//Cuenta los tweet de las palabras
myDB.prototype.getTweetFicheros= function() {
    var ficheros = this.getDatasets();
    var lista = this.numeroTweets;
    for (fichero in ficheros) {
        this.getLineas(ficheros[fichero],function(data){
            lista[data.name]=data.lineas;
        });
    }
}

//Almacena el numero de palabras de cada dataset y las ordena
myDB.prototype.getPalabrasDataset = function(){
    var lista = this.vecesPalabras;
    var datasets = this.datasets;
    for(fichero in this.datasets){
        this.nVecesPalabra(datasets[fichero],function(data){
            //lista[datasets[fichero]]=data.result;
            lista[data.name]=data.result;
        });
    }
}

myDB.prototype.inspectDatasets = function(){
     var dataDir=this.dataDir
     files= gb.glob(this.dataDir+'*.json',{sync:true});
     this.datasets=files.map(function(e){
                     return e.trim().replace(dataDir,"").replace(".json","")
                    });
     return true;
}

myDB.prototype.getDatasets = function(){
      return this.datasets
}

myDB.prototype.filename = function(name){
	   return this.dataDir+name+".json";
}

myDB.prototype.getTimeStamp = function(){
     var date=new Date().toISOString();
     return date;
}

myDB.prototype.createDataset = function(name,data){
     if (this.datasets.indexOf(name) === -1){
         this.datasets.push(name);
         data.type="metadata";
         data.timestamp=this.getTimeStamp();
         fs.appendFile(this.filename(name),JSON.stringify(data)+"\n");
         return true;
      }
      else { return false; }
}

myDB.prototype.insertObject = function(name,data){
      if (this.datasets.indexOf(name) === -1 ){
        return false;
      }

      data.timestamp=this.getTimeStamp();
      data.id=this.lastID;
      this.lastID=data.id+1;
      fs.appendFile(this.filename(name),JSON.stringify(data)+"\n");

      return true;
}

myDB.prototype.getLastObjects= function(name,n,callback){
    if (this.datasets.indexOf(name) !== -1 ){
        xs = sf(this.filename(name));
        var lista=[];
        xs.slice(-n)
        .on('data',function(chunk){
            object=JSON.parse(chunk.toString().trim());
            if (!(object.type !== null && object.type === "metadata")){
                lista.push(JSON.parse(chunk.toString().trim()))
            } 
        })
        .on('end',function(){
          callback({result: lista})
        });
      }
      else{callback({error:'no valid dataset '+name});}
}

myDB.prototype.deleteDataset= function(name){
    if (this.datasets.indexOf(name) !=-1 ){
        fs.unlinkSync(this.filename(name));
        this.datasets.splice(this.datasets.indexOf(name),1);
        return true;
      }
    else {return false; }

}

myDB.prototype.getDatasetInfo = function(name, callback){
	var data = "";
	if (this.datasets.indexOf(name) != 1){
	 	var rd = sf(this.filename(name));
	 	rd.slice(0,1)
	 		.on('data', function(data){
	 			dataResult = data.toString().trim();
	 		})
	 		.on('end',function(){
	          callback({result: dataResult})
	        });
	}
}
//return the first line of the filename of name

myDB.prototype.searchDataset = function(keyword){  //FALTA TERMINARLO
	var result = [];
	for(dataname in this.dataset){
		if(dataname.indexOf(keyword) != -1){
			result.push(dataname);
		}
	}
	return {"result":result};
}

//Cuenta del numero de palabras
myDB.prototype.countWords = function(name, callback){
 	var readStream = fs.createReadStream("./data/"+name+".json");
    var palabras = "";
    readStream.pipe(split())
        .on('data', function(line){
        	if (line.trim()!=""){ //Para que si la ultima linea esta vacia que funcione
            	var data = JSON.parse(line);
            	if (data["text"]!==null){
               		palabras += data["text"] + " ";
            	}
        	}
        })
    .on('end', function(){
       var count = palabras.split(" ").length-2;
       callback({result: count});
    });	
}

//------------

//Comprueba que el dataset exista y sinos lo crea.
myDB.prototype.getDatasetCreated = function(name, data){
    if (this.datasets.indexOf(name) === -1){
        this.datasets.push(name);
        data.type="metadata";
        data.timestamp=this.getTimeStamp();
        fs.appendFile(this.filename(name),JSON.stringify(data)+"\n");
    }
    return true;
}


//Muestra el numero de veces que aparece cada palabra
myDB.prototype.nVecesPalabra = function(name, callback){
    var readStream = fs.createReadStream("./data/"+name+".json");
    var lista = {};
    var result;
    var palabras = "";
    readStream.pipe(split())
    .on('data', function(linea){
    	//console.log(linea);
    	//console.log(JSON.parse(linea));
    	//var data = JSON.parse(linea);
    	var data = linea;
        if (data.text != null) {
        	palabras += data.text + " ";}
       })
    .on('end', function(){
    	var palabras2 = palabras.trim().split(" ");
    	for (palabras3 in palabras2){
    		if(lista[palabras2[palabras3]] !=null){
    			lista[palabras2[palabras3]] += 1;
    		}else{
    			lista[palabras2[palabras3]] = 1;
    		}
    	}
        callback({"result":lista, "name":name});
        });
}



//Calcula la polaridad a nivel de fichero
myDB.prototype.getPolaridad = function(name, callback){
	var DB = this;
	var negativa = 0;
	var positiva = 0;
	var totalPalabras = 0;
	this.nVecesPalabra(name, function(data){
		for(key in data['result']){
         	if (DB.polarities[key] != null){
         		console.log("palabra = "+key+" -- POLARIDAD= "+data['result'][key] +" SIGNO = "+DB.polarities[key]);
         		var polaridad = data['result'][key] * DB.polarities[key]; //data['result'][key];
         		totalPalabras += data['result'][key]; 
         		if(polaridad > 0){
         			positiva += polaridad;
         		}else{
         		 	negativa += polaridad;	
         		}
         		//console.log("Total = "+totalPalabras);
         		//console.log("positiva = "+positiva);
         		//console.log("negativa = "+negativa);
         	}

		}
	callback({"positiva":positiva/totalPalabras, "negativa":negativa/totalPalabras}); 
    });

}

myDB.prototype.getLastTweets = function(name,callback) {
    var tweets = [];
    this.getLastObjects(name,5,function(data){
        for (tweet in data.result) {
            tweets.push(data.result[tweet].id);
        }
        callback({result:tweets});
    });
}

//Saber las 20 palabras mas repetidas de un dataset.
myDB.prototype.getNword = function(name,n,callback) {
	
    var lista = this.vecesPalabras[name];
    var items = Object.keys(lista).map(function (key) {
        return [key, lista[key]];
    });

    items.sort(function (first, second) {
        return second[1] - first[1];
    });

    callback({result:items.slice(0,n)});

}

myDB.prototype.getLocalizacion = function(name,callback){
    var lista = {};
    var readStream = fs.createReadStream("./data/"+name+".json");
    readStream.pipe(split())
        .on('data', function(line){
            //var lineas = JSON.parse(line);
            var lineas = line;
            if(lineas.coordinates != null){
                lista[lineas.id] = [lineas.coordinates.coordinates[1],lineas.coordinates.coordinates[0]];
            }
        })
        .on('end', function(){
            callback({result:lista});
        });

}


myDB.prototype.getCabecera = function(){
    var lista = this.cabeceras;
    var datasets = this.datasets;
    for(x in datasets){
        this.getDatasetInfo(datasets[x],function(data){
            lista.push(data.result);
        });
    }
}





exports.myDB = myDB
