function stupid_spacing(x) {return "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".repeat(x)};
function encase_in_p_w_left_margin(content, level, id) {
    return `<p id="${id}" style="margin: 0px;margin-left:${level*10}px"> ${content} </p>`
}
function encase_in_div_w_left_margin(content, level, id) {
    return `<div id="${id}" style="margin: 0px;margin-left:${level*10}px"> ${content} </div>`
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, 
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


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

function nested_query(target_uri, target_lang) {
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

function dbpedia_explore_query(target_term, target_lang) {
    // ressemble à 
    return `
        SELECT ?x ?wikiPageWikiLink ?wikiPageWikiLinkLabel
        WHERE {
            ?x 
                rdfs:label "${target_term}"@${target_lang};
                <http://dbpedia.org/ontology/wikiPageWikiLink> ?wikiPageWikiLink.

            ?wikiPageWikiLink rdfs:label ?wikiPageWikiLinkLabel

            FILTER (lang(?wikiPageWikiLinkLabel) = '${target_lang}')
        }
    `
}

function PerformQuery_withhtml(target_contener, target_term, target_lang) {
    // Create a graphology graph
    const graph = new graphology.Graph();
    graph.addNode(`root - ${target_term}`, { label: `root - ${target_term}`, x: Math.random(), y: Math.random(), size: 50, color: "blue" });
    nodes.add({id: `root - ${target_term}`, label: `root - ${target_term}`})
    
    let result_nodes = [];
    let r_query = root_query(target_term, target_lang);
    let url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=' + encodeURIComponent(r_query) + '&output=json';

    $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
            let res = "" 

            //html processing
            for (const e of data["results"]["bindings"]) {
                result_nodes.push(e["object"]["value"])

                //entity
                res += `<a href="${e["object"]["value"]}" target="_blank">${e["label"]["value"]}</a> (${e["object"]["value"]})<br>`
                //what is this entity
                res += encase_in_p_w_left_margin(`is : <a href="${e["instanceClass"]["value"]}" target="_blank">${e["instanceClassLabel"]["value"]}</a> : ${e["instanceClassDescription"]["value"]}<br>`, 1, e["object"]["value"].replace("http://www.wikidata.org", "")+"-parent")
                //childs found from dbpedia
                res += encase_in_div_w_left_margin(`has childs : [.....................................] <br>`, 1, e["object"]["value"].replace("http://www.wikidata.org", ""))
            }
            $(`#${target_contener}`).html(res);


            //graph processing
            for (const e of data["results"]["bindings"]) {
                //graph.addNode(e["object"]["value"], { label: e["instanceClassLabel"]["value"], x: Math.random(), y: Math.random(), size: 30, color: "blue" });
                //graph.addEdge(`root - ${target_term}`, e["instanceClassLabel"]["value"], { size: 5, color: "purple" });

                nodes.add({id: `${e["label"]["value"]} - ${e["instanceClassLabel"]["value"]}`, label: `${e["label"]["value"]} - ${e["instanceClassLabel"]["value"]}`});
                edges.add({from: `root - ${target_term}`, to: `${e["label"]["value"]} - ${e["instanceClassLabel"]["value"]}`});
            }
        }
    })


    let n_query = dbpedia_explore_query(target_term, target_lang);
    url = 'https://dbpedia.org/sparql/?query=' + encodeURIComponent(n_query) + '&output=json';

    $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
            console.log(JSON.stringify(data["results"]["bindings"]))
            let res = `has childs : <br>`;
            for (const e of data["results"]["bindings"]) {
                    //result_nodes.push(e["object"]["value"])

                    //res += `<a href="${e["object"]["value"]}" target="_blank">${e["label"]["value"]}</a> (${e["object"]["value"]})<br>`
                    //res += `<a href="${e["wikiPageWikiLink"]["value"]}" target="_blank">${e["wikiPageWikiLinkLabel"]["value"]}</a><br>`;
                    res += encase_in_p_w_left_margin(`- <a href="${e["wikiPageWikiLink"]["value"]}" target="_blank">${e["wikiPageWikiLinkLabel"]["value"]}</a>`, 2, e["wikiPageWikiLink"]["value"]+"-parent")
                    //res += encase_in_div_w_left_margin(`${stupid_spacing(1)} has childs : [.....................................] <br>`,1 , e["object"]["value"])
                
            }
            //document.getElementById("/entity/Q234081").innerHTML = res;
            //$(`#/entity/Q234081`).html(res);
            //$(`#${target_contener}`).html(res);

            //graph processing
            for (const e of data["results"]["bindings"]) {
                //graph.addNode(e["wikiPageWikiLinkLabel"]["value"], { label: e["wikiPageWikiLinkLabel"]["value"], x: Math.random(), y: Math.random(), size: 10, color: "blue" });
                //graph.addEdge("http://www.wikidata.org/entity/Q234081", e["wikiPageWikiLinkLabel"]["value"], { size: 5, color: "purple" });
                
                //nodes.add({id: e["wikiPageWikiLinkLabel"]["value"], label: e["wikiPageWikiLinkLabel"]["value"]})
                //edges.add({from: "http://www.wikidata.org/entity/Q234081", to: e["wikiPageWikiLinkLabel"]["value"]});
            }
        }
    });
    // Instantiate sigma.js and render the graph
    //const sigmaInstance = new Sigma(graph, document.getElementById("container"));
};


function PerformQuery(target_contener, target_term, target_lang) {
    // Create graph
    
    //nodes.add({id: `root - ${target_term}`, label: `root - ${target_term}`})
    //graph.nodes.push({id: `root - ${target_term}`,label: `root - ${target_term}`,x: Math.random(),y: Math.random(),size: 1,color: '#EE651D'});
    graph.addNode(`root - ${target_term}`,{label: `root - ${target_term}`,x: Math.random(),y: Math.random(),size: 10,color: '#EE651D'});
    
    let r_query = root_query(target_term, target_lang);
    let url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=' + encodeURIComponent(r_query) + '&output=json';

    $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
            //graph processing
            for (const e of data["results"]["bindings"]) {
                let node_id = `${e["label"]["value"]} - ${e["instanceClassLabel"]["value"]}`;
                //vis.js
                // nodes.add({id: node_id, label: node_id});
                // edges.add({from: `root - ${target_term}`, to: node_id});
                //sigma.js et graphology
                console.log(JSON.stringify(e))
                //graph.nodes.push({id: node_id, label: node_id, x: Math.random(), y: Math.random(), size: 1, color: '#EE651D'});
                //graph.edges.push({id: uuidv4(), source: `root - ${target_term}`, target: node_id ,color: '#202020',type: 'curved'});
                graph.addNode(node_id,{label: node_id, x: Math.random(), y: Math.random(), size: 10, color: '#EE651D'});
                graph.addEdge(`root - ${target_term}`, node_id ,{color: '#202020',size: 1});
                //s.refresh(); 

                if("system of politics and government" === e["instanceClassDescription"]["value"]) {
                    url = 'https://dbpedia.org/sparql/?query=' + encodeURIComponent(dbpedia_explore_query(target_term, target_lang)) + '&output=json';
                    $.ajax({
                        url: url,
                        dataType: "json",
                        success: function (data) {
                            //graph processing
                            for (const el of data["results"]["bindings"]) {
                                let child_node_id = el["wikiPageWikiLink"]["value"]
                                //vis.js
                                // nodes.add({id: child_node_id, label: child_node_id})
                                // edges.add({from: node_id, to: child_node_id});
                                //sigma.js graphology
                                
                                
                                //graph.nodes.push({id: child_node_id,label: child_node_id,x: Math.random(),y: Math.random(),size: 1,color: '#EE651D'});
                                //graph.edges.push({id: uuidv4(), source: child_node_id, target: node_id,color: '#202020',type: 'curved'});

                                graph.addNode(child_node_id,{label: child_node_id,x: Math.random(),y: Math.random(),size: 10,color: '#EE651D'});
                                graph.addEdge(child_node_id, node_id,{color: '#202020',size: 1});

                                //s.refresh(); 
                                
                            }
                        }
                    });
                }
            }
        }
    })
    
};

// // create a network
// let nodes = new vis.DataSet([]);
// let edges = new vis.DataSet([]);
// let data = {
// 	nodes: nodes,
// 	edges: edges,
// };
// let container = document.getElementById("network");
// let options = {
// 	interaction: {
// 		navigationButtons: true,
// 		keyboard: true,
// 	},
// 	nodes: {
// 		shape: "dot",
// 		size: 30,
// 		font: {
// 			size: 32,
// 			color: "#8c8674",
// 		},
// 		borderWidth: 2,
       
// 	},
// 	edges: {
// 		width: 2,
//         smooth : true,
// 	},
// 	physics: false,
// 	layout: {
// 		hierarchical: {
// 			levelSeparation: 150,
// 			nodeSpacing: 200,
// 			treeSpacing: 200,
// 			direction: "UD",
// 			sortMethod: 'directed',
// 			blockShifting: false,
// 		},
// 	},
// };

// options = {
//     physics: {
//         forceAtlas2Based: {
//             gravitationalConstant: -26,
//             centralGravity: 0.005,
//             springLength: 230,
//             springConstant: 0.18,
//             avoidOverlap: 1.5
//         },
//         maxVelocity: 146,
//         solver: 'forceAtlas2Based',
//         timestep: 0.35,
//         stabilization: {
//             enabled: true,
//             iterations: 1000,
//             updateInterval: 25
//         }
//     }
// };
// let network = new vis.Network(container, data, options);

// network.on("stabilizationIterationsDone", function () {
//     network.setOptions({
//         nodes: {physics: false},
//         edges: {physics: false},
//     });
// });


// const s = new sigma(
//     {
//       renderer: {
//         container: document.getElementById('container'),
//         type: 'canvas'
//       },
//       settings: {
//         minArrowSize: 10
//       }
//     }
// );
// var graph = {
//     nodes: [],
//     edges: []
// };
const graph = new graphology.Graph();
const s = new Sigma(graph, document.getElementById("container"));
const start_lang = "en"
const start_term = "Ancien Régime"
const start_contener = "result";

PerformQuery(start_contener, start_term, start_lang);



//s.graph.read(graph);
// draw the graph
s.refresh();
// launch force-atlas for 5sec
s.startForceAtlas2();
//window.setTimeout(function() {s.killForceAtlas2()}, 10000);



