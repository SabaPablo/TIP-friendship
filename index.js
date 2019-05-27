const express = require("express");
const neo4j = require('./neo4j')
const bodyParser = require('body-parser');
const app = express();

// Tell it to use Neo4j middleware
app.use(neo4j);

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});


// Example Route
app.post('/user', (req, res) => {
    // Create Driver session
    const session = req.driver.session();

    // Run Cypher query
    const cypher = 'CREATE (a:User { mail : "'+req.body.mail+'" })';

    session.run(cypher)
        .then(result => {
            // On result, get count from first record

            // Send response
            res.status(200).json({
                ok:true,
                message:'created User!',
                user : result
            })
        })
        .catch(e => {
            // Output the error
            res.status(500).send(e);
        })
        .then(() => {
            // Close the session
            return session.close();
        });
});

// Example Route
app.post('/relationship', (req, res) => {
    // Create Driver session
    const session = req.driver.session();

    // Run Cypher query
    const cypher = 'MATCH (a:User),(b:User)'+
    'WHERE a.mail = "'+ req.body.aMail+'" AND b.mail = "'+ req.body.bMail+ '"'+
    'CREATE (a)-[r:FRIEND]->(b)'+
    'RETURN r';

    session.run(cypher)
        .then(result => {

            res.status(200).json({
                ok:true,
                message:'new friends!',
                relation : result
            })
        })
        .catch(e => {
            // Output the error
            res.status(500).send(e);
        })
        .then(() => {
            // Close the session
            return session.close();
        });
});

app.get('/friends', (req, res) => {
    // Create Driver session
    const session = req.driver.session();

    // Run Cypher query
    const cypher = 'MATCH (user { mail: '+ req.query.mail+' })--(friend)'+
    'RETURN friend.mail as mails';


    session.run(cypher,{mail:neo4j.String})
        .then(result => {
            let array = [];

            async function printFiles () {

                result.records.forEach(async (record) => {
                    console.log( record.get("mails") ); // Access the name property from the RETURN statement
                    array.push(record.get("mails"))
                })
            }

            printFiles();

            res.status(200).json({
                ok:true,
                message:'friends founds!',
                relation : array
            })

        })
        .catch(e => {
            // Output the error
            res.status(500).send(e);
        })
        .then(() => {
            // Close the session
            return session.close();
        });
});



// Example Route
app.get('/', (req, res) => {
    // Create Driver session
    const session = req.driver.session();

    // Run Cypher query
    const cypher = 'MATCH (n) RETURN count(n) as count';

    session.run(cypher)
        .then(result => {
            // On result, get count from first record
            const count = result.records[0].get('count');

            // Send response
            res.send({count: count.toNumber()});
        })
        .catch(e => {
            // Output the error
            res.status(500).send(e);
        })
        .then(() => {
            // Close the session
            return session.close();
        });
});



app.listen(3200, () => {
    console.log("El servidor está inicializado en el puerto 3200");
});