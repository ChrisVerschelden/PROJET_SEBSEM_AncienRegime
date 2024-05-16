const my_prefixes = `
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX : <http://dbpedia.org/resource/>
PREFIX dbpedia2: <http://dbpedia.org/property/>
PREFIX dbpedia: <http://dbpedia.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>
PREFIX pq: <http://www.wikidata.org/prop/qualifier/>

PREFIX endwikidata: <https://query.wikidata.org/sparql>
PREFIX endDBpedia: <http://dbpedia.org/sparql>
PREFIX endDBpediaFR: <http://fr.dbpedia.org/sparql>
`;

function root_query(target_term, target_lang) {
    // ressemble à 
    // {
    //     "object": {"type":"uri","value":"http://www.wikidata.org/entity/Q56639845"},
    //     "instanceOf":{"type":"uri","value":"http://www.wikidata.org/entity/statement/Q56639845-BB8EFCBA-3223-488A-AC46-9DED12BF2E06"},
    //     "label":{"xml:lang":"en","type":"literal","value":"Ancien Régime"},
    //     "w":{"type":"uri","value":"http://www.wikidata.org/prop/statement/P31"},
    //     "instanceClass":{"type":"uri","value":"http://www.wikidata.org/entity/Q13442814"},
    //     "instanceClassLabel":{"xml:lang":"en","type":"literal","value":"scholarly article"},
    //     "instanceClassDescription":{"xml:lang":"en","type":"literal","value":"article in an academic publication, usually peer reviewed"}
    // }
    return `
        ${my_prefixes}
        
        SELECT ?object ?label ?instanceOf ?w ?instanceClass ?instanceClassLabel ?instanceClassDescription
        WHERE
        {
        ?object 
            rdfs:label "${target_term}"@${target_lang};
            rdfs:label ?label;
            p:P31 ?instanceOf.

            ?instanceOf ?w ?instanceClass.
            ?instanceClass 
            rdfs:label ?instanceClassLabel;
            schema:description ?instanceClassDescription.
            
            
            FILTER (lang(?label) = '${target_lang}')
            FILTER (lang(?instanceClassLabel) = '${target_lang}')
            FILTER (lang(?instanceClassDescription) = '${target_lang}')
        }
    `
}

// function dbpedia_explore_query_old(target_term, target_lang) {
//     // ressemble à 
//     return `
//         SELECT ?x ?wikiPageWikiLink ?wikiPageWikiLinkLabel
//         WHERE {
//             ?x 
//                 rdfs:label "${target_term}"@${target_lang};
//                 <http://dbpedia.org/ontology/wikiPageWikiLink> ?wikiPageWikiLink.

//             ?wikiPageWikiLink rdfs:label ?wikiPageWikiLinkLabel

//             FILTER (lang(?wikiPageWikiLinkLabel) = '${target_lang}')
//         }
//     `
// }

function dbpedia_from_wikidata_query(target_term, target_lang) {
    // ressemble à 
    return `
    SELECT ?ressource
    WHERE {
        ?ressource rdfs:label "Ancien Régime"@en.
    }
    `
}

function dbpedia_explore_ressource_query(target_ressource, target_lang) {
    // ressemble à 
    return `
        SELECT ?wikiPageWikiLink ?wikiPageWikiLinkLabel
        WHERE {
            <http://fr.dbpedia.org/resource/Société_d'Ancien_Régime> <http://dbpedia.org/ontology/wikiPageWikiLink> ?wikiPageWikiLink.

            ?wikiPageWikiLink rdfs:label ?wikiPageWikiLinkLabel

            FILTER (lang(?wikiPageWikiLinkLabel) = 'fr')
        }
    `
}

async function explore_ressource(graph, target_ressource, target_lang) {
    url = 'https://dbpedia.org/sparql/?query=' + encodeURIComponent(dbpedia_explore_ressource_query(target_ressource.value, target_lang)) + '&output=json';
    await $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
            //graph processing
            console.log('hey')
            console.log("explore ressource")
            console.log(data)

            for (const el of data["results"]["bindings"]) {
                let child_node_id = el["wikiPageWikiLink"]["value"]
                graph.nodes.push({id: child_node_id, label: child_node_id ,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: '#EE651D'});
                graph.edges.push({id: uuidv4(), source: node_id, target: child_node_id,color: '#202020',type: 'curved'});
            }
            graph = resize_graph(graph);

        }
    });
    //graph.nodes.concat(discovered_nodes)
    return graph;
}

async function explore(graph, nodes_to_explore, level) {
    if (level === 0) return nodes;
    let discovered_nodes = [];

    for (const node of nodes_to_explore) {
        
    }






    // url = 'https://dbpedia.org/sparql/?query=' + encodeURIComponent(dbpedia_explore_query(target_term, target_lang)) + '&output=json';
    // await $.ajax({
    //     url: url,
    //     dataType: "json",
    //     success: function (data) {
    //         //graph processing
    //         for (const el of data["results"]["bindings"]) {
    //             let child_node_id = el["wikiPageWikiLink"]["value"]
    //             discovered_nodes.push({id: child_node_id, label: child_node_id ,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: '#EE651D'});
    //             graph.edges.push({id: uuidv4(), source: node_id, target: child_node_id,color: '#202020',type: 'curved'});
    //         }
    //         graph = resize_graph(graph);

    //     }
    // });
    // graph.nodes.concat(discovered_nodes)
}