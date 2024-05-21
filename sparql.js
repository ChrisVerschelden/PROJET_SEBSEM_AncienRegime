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

function requete_dbpedia_root_events(target_lang) {
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

function requete_dbpedia_ressource_by_entity(target_entity, target_lang) {
    return `
        ${my_prefixes}
        SELECT ?ressource ?wikiPageWikiLink ?wikiPageWikiLinkLabel
        WHERE {
            ?ressource 
                owl:sameAs <http://www.wikidata.org/entity/${target_entity}>;
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


async function collection_of_event_step_1(graph, target_term, target_lang) {
    //graph root
    let id_root = `root - ${target_term}`;
    graph.nodes.push({ id:  id_root,label: id_root,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE*50,color: EROOT_NODE_COLOR});

    let event_ids = [];

    url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=' + encodeURIComponent(requete_dbpedia_root_events(target_lang)) + '&output=json';
    await $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
            //graph processing
            console.log(data)
            for (const el of data.results.bindings) {
                if(!(el.date.value.split("-")[0] >= 1589 && el.date.value.split("-")[0] <= 1789)) {continue}
                let child_node_id = el.event.value;
                let tmp_node = {id: child_node_id, label: el.labelEvent.value ,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: EVENT_NODE_COLOR, hover_color: EDGE_COLOR_VARIANT};

                //si le noeud n'existe pas on l'ajoute
                if(!event_ids.includes(child_node_id)){
                    graph.nodes.push(tmp_node);
                    event_ids.push(child_node_id);
                    graph.edges.push({id: uuidv4(), source: id_root, target: child_node_id, size: 1, color: EDGE_COLOR,type: 't'});
                }
            }
        }
    });
    return [graph, event_ids];
}

async function collection_of_dbpedia_ressources(graph, event_ids, target_lang) {
    let wikilink_ids = [];

    for (const event_id of event_ids) {
        let isolated_id = event_id.split('/').slice(-1);
        let url = 'https://dbpedia.org/sparql/?query=' + encodeURIComponent(requete_dbpedia_ressource_by_entity(isolated_id, target_lang)) + '&output=json';
        await $.ajax({
            url: url,
            dataType: "json",
            success: function (data) {
                //graph processing
                for (const el of data.results.bindings) {
                    let child_node_id = el.wikiPageWikiLink.value
                    let tmp_node = {id: child_node_id, label: child_node_id ,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: WIKIL_NODE_COLOR, hover_color: EDGE_COLOR_VARIANT}
                    
                    //si le noeud n'existe pas on l'ajoute
                    if(!wikilink_ids.includes(child_node_id)){
                        graph.nodes.push(tmp_node);
                        wikilink_ids.push(child_node_id);
                        graph.edges.push({id: uuidv4(), source: event_id, target: child_node_id, size: 1, color: EDGE_COLOR,type: 't'});
                    } else {
                        graph.edges.push({id: uuidv4(), source: event_id, target: child_node_id, size: 1, color: EDGE_COLOR,type: 't'});
                    }
                }
            }
            
        });
    }

    //etendre le graph
    if (false) {
        let cpt = 0;
        for (const wikilink_id of wikilink_ids) {
            let url = 'https://dbpedia.org/sparql/?query=' + encodeURIComponent(requete_dbpedia_ressource(wikilink_id, target_lang)) + '&output=json';
            await $.ajax({
                url: url,
                dataType: "json",
                success: function (data) {
                    //graph processing
                    for (const el of data.results.bindings) {
                        let child_node_id = el.wikiPageWikiLink.value
                        let tmp_node = {id: child_node_id, label: child_node_id ,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: WIKIL_NODE_COLOR, hover_color: EDGE_COLOR_VARIANT}
                        
                        //si le noeud n'existe pas on l'ajoute
                        if(!wikilink_ids.includes(child_node_id)){
                            graph.nodes.push(tmp_node);
                            wikilink_ids.push(child_node_id);
                            graph.edges.push({id: uuidv4(), source: wikilink_id, target: child_node_id, size: 1, color: EDGE_COLOR,type: 't'});
                        } else {
                            graph.edges.push({id: uuidv4(), source: child_node_id, target: wikilink_id, size: 1, color: EDGE_COLOR,type: 't'});
                        }
                    }
                }
                
            });
            if(cpt > 350) {return} else {cpt++}
        }
    }

    return [graph, wikilink_ids];
}