const BASE_NODE_SIZE = 10
const TARGET_LANG = 'en'

function build_graph_test(graph) {
    // Generate a random graph:
    let nbNode = 50;
    let nbEdge = 500;
    for (i = 0; i < nbNode; i++)
        graph.nodes.push({ 
            id:  i,
            label: 'Node ' + i,
            x: Math.random(),
            y: Math.random(),
            size: BASE_NODE_SIZE,
            color: '#EE651D'
        });

    for (i = 0; i < nbEdge; i++)
        graph.edges.push({ 
            id: i, 
            source: '' + (Math.random() * nbNode | 0), 
            target: '' + (Math.random() * nbNode | 0),
            color: '#202020',
            type: 'curved'
        });

    return graph;
}

async function build_graph(graph, target_term, target_lang) {
    //graph root
    graph.nodes.push({ id:  `root - ${target_term}`,label: `root - ${target_term}`,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: '#EE651D'});

    //first expension of the graph
    let r_query = root_query(target_term, target_lang);
    let url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=' + encodeURIComponent(r_query) + '&output=json';

    await $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
            //graph processing
            for (const e of data["results"]["bindings"]) {
                let node_id = `${e["label"]["value"]} - ${e["instanceClassLabel"]["value"]}`;
                //sigma.js et graphology
                graph.nodes.push({id: node_id, label: node_id ,x: Math.random(),y: Math.random(),size: BASE_NODE_SIZE,color: '#EE651D', info: {e}});
                graph.edges.push({id: uuidv4(), source: `root - ${target_term}`, target: node_id,color: '#202020',type: 'curved'});
            }
        }
    });

    //first expension of the graph
    url = 'https://dbpedia.org/sparql/?query=' + encodeURIComponent(dbpedia_from_wikidata_query(target_term, target_lang)) + '&output=json';
    console.log(url)
    let ressource = {}
    await $.ajax({
        url: url,
        dataType: "json",
        success: function (data) {
            //graph processing
            console.log(data)
            
        }
    });


    for (const node of graph.nodes) {
        if("Ancien Régime - political system" === node.id) {
            //await explore(graph, [node], 1);
            await explore_ressource(graph, ressource, TARGET_LANG)
            console.log("yo")
        }
    }

    return graph;
}

function resize_graph(graph) {
    let new_nodes = [];
    let cpt = 1;
    for (const node of graph.nodes) {
        cpt = 1;
        for (const edge of graph.edges) {
            if(edge.source === node.id) cpt++;
            if(edge.target === node.id) cpt++;
        }
        new_nodes.push({id: node.id, label: node.label, x: node.x, y: node.y, size: (cpt*BASE_NODE_SIZE), color: node.color});
    }
    let new_graph = {nodes: new_nodes,edges: graph.edges};
    return new_graph;
}

async function main() {
    // Initialise sigma:
    let s = new sigma(
        {
            renderer: {
            container: document.getElementById('sigma-container'),
            type: 'canvas'
            },
            settings: {
            minArrowSize: 1
            }
        }
    );
    let graph = {nodes: [],edges: []};
    graph = await build_graph(graph, "Ancien Régime", "en");
    graph = resize_graph(graph);
    // load the graph
    s.graph.read(graph);
    // draw the graph
    s.refresh();
    // launch force-atlas for 1sec
    s.startForceAtlas2();
    window.setTimeout(function() {s.killForceAtlas2()}, 1000);
}

main(); 