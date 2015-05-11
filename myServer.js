//mongodb
var MongoClient = require('mongodb');
var assert=require("assert");

var application_root=__dirname,
    express = require("express"),
    path = require("path")

var app = express();

var util = require('util'),
    twitter = require('twitter');
var twit = new twitter({
    consumer_key: 'GRzuAZHSQbMKNMWKQXKTbSWN2',
    consumer_secret: 'Qa5sKJJBtqCU6vPnjQr8LJdlTVUopDtrphfl55zOpEiKWYcV0j',
    access_token_key: '3065985165-wOqbYr0PtIMY2P9UHBPBDkY48zBdHNWnlhsZQOc',
    access_token_secret: 'mnbMY9iOAi25N0UYz54GPwAsuVga3ppVSwB4APq91Ufp5'
});


app.use(express.static(path.join(application_root,"public")));

var bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

var db=require('./myModule');
var DB=new myDB('./data');


DB.getPalabrasDataset();
DB.getTweetFicheros();
DB.getCabecera();

app.get('/',function(req,res){
    res.sendFile("public/myMashup.html",{root:application_root});
});

app.get('/index.html',function(req,res){
    res.sendFile("public/myMashup.html",{root:application_root});
});

app.get('/public/:fname',function(req,res){
	res.sendFile("public/"+req.params.fname,{root:application_root});
});

app.get('/stream',function(req,res){
    res.send({result: DB.numeroTweets});
});

/*app.get('/blog/delete/:name',function(req,res){
    if (DB.deleteDataset(req.params.name)){
        res.send({result:'OK'})
    }
    else{
        res.send({error:'some DB error'});
    }  
});*/

/*
app.post('/blog',function(req,res){
    if (req.body !== null && req.body.title !== null){
        if (DB.createDataset(req.body.title,req.body)){
            res.send({result:'OK'});
        }
        else{ res.send({error:'this dataset already exists'}) }
        
    }
    else { res.send({error:'missing title'}) }
});

app.get('/blog/:name',function(req,res){
    n = (req.query.n == null) ? 10 : parseInt(req.query.n);
    DB.getLastObjects(req.params.name,n,function(data){
        res.send(data);
    })
})

app.post('/blog/:name',function(req,res){
    if (req.body !== null && req.params.name.length>0){
        if (DB.insertObject(req.params.name,req.body)){
            res.send({result:'OK'})
        }
        else { res.send({error:'some DB error'}); }
    }
    else { res.send({error:'no data provided'});}
});
*/

/*
app.post('/stream/',function(req,res){
    var json = {"creator":"yo","about":req.body.name,"type":"","timestamp":""};
    DB.createDataset(req.body.name,json);

    DB.getDatasetInfo(req.body.name,function(data){
    });
    guardarTweet(req.body.name, DB);
    if(DB.datasets.indexOf(req.body.name)!=-1){
        setTimeout(function() {
        	DB.getPalabrasDataset();
            DB.getTweetFicheros();
        }, 5000);


        res.send({result:'Success'});
    }
    else {
        res.send({error: 'ERROR'});
    }
});
*/

app.post('/stream/',function(req,res){
    //var json = {"@id":req.body.id,"@context":"http://schema.org/","@type":"SearchAction",
    //    "agent":{"@type":"Person","name":req.body.agent},
     //   "query":req.body.data,"sameAs":req.body.sameAs,"location":req.body.location,"url":"localhost:8000/"+req.body.id};
    DB.createDataset(req.body["@id"],req.body);

	console.log("POST SERVER"+JSON.stringify(req.body));

    guardarTweet(req.body["@id"], DB);
    
     MongoClient.connect("mongodb://localhost:27017/twitter", {native_parser:true},
        function(err, db) {
            assert.equal(null, err);
            db.collection('jsonld').insertOne(json,
                function(err, result) {
                    assert.equal(null, err);
                    console.log(result.insertedId);
                    db.close();
                });
        });
    
    if(DB.datasets.indexOf(req.body["@id"])!=-1){
        setTimeout(function() {
            DB.getPalabrasDataset();
            DB.getTweetFicheros();
            DB.getCabecera();
        }, 5000);


        res.send({result:'Success'});
    }
    else {
        res.send({error: 'ERROR'});
    }
});


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

//GET /blog/:name/words
app.get('/stream/:name/words/',function(req,res){
   DB.getNword(req.params.name,20,function(data){
       res.send(data);
       console.log(data);
   });
});

//GET /blog/search

//GET /blog/:name/info


app.get('/stream/:name/polarity/',function(req,res){
    DB.getPolaridad(req.params.name,function(data){
        res.send(data);
    });
});

app.get('/stream/:name/', function(req, res){
	console.log(req.params.name);
    DB.getLastTweets(req.params.name, function(data){
       res.send(data);
    });
});


app.get('/stream/:name/geo/',function(req,res){
	
    DB.getLocalizacion(req.params.name,function(data){
        res.send(data);
    });
});

app.get('/stream/graph/',function(req,res){
    console.log(DB.cabeceras);
    res.send({result:DB.cabeceras});
});

console.log("Web server running on port 8000");

app.listen(8000);


