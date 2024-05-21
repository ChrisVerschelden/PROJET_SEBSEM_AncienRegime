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

function query_wikidata(target_term, target_lang) {
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


//const EDGE_COLOR = '#FFFFFF'
const EDGE_COLOR = '#202020'
const NODE_COLOR = '#EE651D'



function requete_dbpedia_root(target_term, target_lang) {
    return `
        SELECT ?ressource ?wikiPageWikiLink ?wikiPageWikiLinkLabel
        WHERE {
            ?ressource 
                rdfs:label "${target_term}"@${target_lang};
                <http://dbpedia.org/ontology/wikiPageWikiLink> ?wikiPageWikiLink.

            ?wikiPageWikiLink rdfs:label ?wikiPageWikiLinkLabel

            FILTER (lang(?wikiPageWikiLinkLabel) = '${target_lang}')
        }
    `;
}

function requete_dbpedia_ressource(target_ressource, target_lang) {
    //http://fr.dbpedia.org/resource/Société_d'Ancien_Régime
    return `
        SELECT ?wikiPageWikiLink ?wikiPageWikiLinkLabel
        WHERE {
            <${target_ressource}> <http://dbpedia.org/ontology/wikiPageWikiLink> ?wikiPageWikiLink.

            ?wikiPageWikiLink rdfs:label ?wikiPageWikiLinkLabel

            FILTER (lang(?wikiPageWikiLinkLabel) = '${target_lang}')
        }
    `;
}

async function step_1(graph, nodes_ids, target_term, target_lang) {
    //graph root
    let id_root = `root - ${target_term}`;
    graph.nodes.push({ id:  id_root,label: id_root,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: NODE_COLOR});

    let discovered_nodes = []

    url = 'https://dbpedia.org/sparql/?query=' + encodeURIComponent(requete_dbpedia_root(target_term, target_lang)) + '&output=json';
    await $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
            //graph processing
            console.log(data)
            for (const el of data["results"]["bindings"]) {
                let child_node_id = el["wikiPageWikiLink"]["value"]
                let tmp_node = {id: child_node_id, label: child_node_id ,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: NODE_COLOR}
                discovered_nodes.push(tmp_node);
                nodes_ids.push(child_node_id)
                graph.nodes.push(tmp_node);
                graph.edges.push({id: uuidv4(), source: id_root, target: child_node_id,color: EDGE_COLOR,type: 'curved'});
                
            }
        }
    });
    return [graph, discovered_nodes];
}

async function step_2(graph, nodes_ids, discovered_nodes, target_lang) {
    let cpt = 0;
    console.log(discovered_nodes.length)
    for (const node of discovered_nodes) {
        url = 'https://dbpedia.org/sparql/?query=' + encodeURIComponent(requete_dbpedia_ressource(node.id, target_lang)) + '&output=json';
        await $.ajax({
            url: url,
            dataType: "json",
            success: function (data) {
                //graph processing
                for (const el of data["results"]["bindings"]) {
                    let child_node_id = el["wikiPageWikiLink"]["value"]
                    let tmp_node = {id: child_node_id, label: child_node_id ,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: '#EE651D'}
                    
                    //si le noeud n'existe pas on l'ajoute
                    if(!nodes_ids.includes(child_node_id)){
                        graph.nodes.push(tmp_node);
                        discovered_nodes.push(tmp_node);
                        nodes_ids.push(child_node_id);
                        graph.edges.push({id: uuidv4(), source: node.id, target: child_node_id,color: EDGE_COLOR,type: 'curved'});
                    } else {
                        graph.edges.push({id: uuidv4(), source: child_node_id, target: node.id,color: EDGE_COLOR,type: 'curved'});
                    }
                }
            }
            
        });

        cpt++;
        if (cpt === 377) {return}
    }
    console.log(graph.nodes.length)
    console.log(graph.edges.length)
    return [graph, discovered_nodes];
}






/////////////////// events ///////////////////////////////////

////////// info wikidata ///////////////////
// wdt:P31 -> nature de l'element
// wd:Q28108 -> systeme politique
// wdt:P17 -> pays
// wd:Q13418847 -> evenement historique
// wd:Q142 -> france
// wd:Q234081 -> ancien régime 
// wdt:P585 -> date
// 1589 - 1791 -> début et fin ancien régime
///////////////////////////////////////////

function requete_dbpedia_root(target_lang) {
    return `
        ${my_prefixes}
        SELECT ?event ?labelEvent ?date
        WHERE {
            ?event 
                rdfs:label ?labelEvent;
                wdt:P31/wdt:P279* wd:Q13418847;
                wdt:P585 ?date;
                wdt:P17 wd:Q142.
            
            FILTER (lang(?labelEvent) = '${target_lang}')
        }
    `;
}

function requete_dbpedia_ressource(target_ressource, target_lang) {
    return `
        ${my_prefixes}
        SELECT ?wikiPageWikiLink ?wikiPageWikiLinkLabel
        WHERE {
            <${target_ressource}> <http://dbpedia.org/ontology/wikiPageWikiLink> ?wikiPageWikiLink.

            ?wikiPageWikiLink rdfs:label ?wikiPageWikiLinkLabel

            FILTER (lang(?wikiPageWikiLinkLabel) = '${target_lang}')
        }
    `;
}

async function step_1(graph, nodes_ids, target_term, target_lang) {
    //graph root
    let id_root = `root - ${target_term}`;
    graph.nodes.push({ id:  id_root,label: id_root,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: NODE_COLOR});

    let discovered_nodes = []

    url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=' + encodeURIComponent(requete_dbpedia_root(target_lang)) + '&output=json';
    await $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
            //graph processing
            console.log(data)
            for (const el of data["results"]["bindings"]) {
                if(!(el.date.value.split("-")[0] >= 1589 && el.date.value.split("-")[0] <= 1789)) {continue}
                let child_node_id = el["event"]["value"]
                let tmp_node = {id: child_node_id, label: el.labelEvent.value ,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: NODE_COLOR}

                //si le noeud n'existe pas on l'ajoute
                if(!nodes_ids.includes(child_node_id)){
                    graph.nodes.push(tmp_node);
                    discovered_nodes.push(tmp_node);
                    nodes_ids.push(child_node_id);
                    graph.edges.push({id: uuidv4(), source: id_root, target: child_node_id,color: EDGE_COLOR,type: 'curved'});
                }
            }
        }
    });
    return [graph, discovered_nodes];
}

async function step_2(graph, nodes_ids, discovered_nodes, target_lang) {
    let cpt = 0;
    console.log(discovered_nodes.length)
    for (const node of discovered_nodes) {
        url = 'https://dbpedia.org/sparql/?query=' + encodeURIComponent(requete_dbpedia_ressource(node.id, target_lang)) + '&output=json';
        await $.ajax({
            url: url,
            dataType: "json",
            success: function (data) {
                //graph processing
                for (const el of data["results"]["bindings"]) {
                    let child_node_id = el["wikiPageWikiLink"]["value"]
                    let tmp_node = {id: child_node_id, label: child_node_id ,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: '#EE651D'}
                    
                    //si le noeud n'existe pas on l'ajoute
                    if(!nodes_ids.includes(child_node_id)){
                        graph.nodes.push(tmp_node);
                        discovered_nodes.push(tmp_node);
                        nodes_ids.push(child_node_id);
                        graph.edges.push({id: uuidv4(), source: node.id, target: child_node_id,color: EDGE_COLOR,type: 'curved'});
                    } else {
                        graph.edges.push({id: uuidv4(), source: child_node_id, target: node.id,color: EDGE_COLOR,type: 'curved'});
                    }
                }
            }
            
        });

        cpt++;
        if (cpt === 377) {return}
    }
    console.log(graph.nodes.length)
    console.log(graph.edges.length)
    return [graph, discovered_nodes];
}