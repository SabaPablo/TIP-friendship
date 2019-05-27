// Require Neo4j
const neo4j = require('neo4j-driver').v1;

// Create Driver
const driver = new neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "neo"));

// Express middleware
module.exports = function(req, res, next) {
    req.driver = driver;

    next();
};