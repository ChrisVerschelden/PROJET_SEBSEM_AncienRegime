const BASE_NODE_SIZE = 10
const TARGET_LANG = 'en'

async function build_graph(graph, target_term, target_lang) {
    let nodes_ids = [];
    let res = await step_1(graph, nodes_ids, target_term, target_lang);
        res = await step_2(graph, nodes_ids, res[1], target_lang);
    return graph;
}

async function build_graph_event(graph, target_term, target_lang) {
    let nodes_ids = [];
    let res = await step_1(graph, nodes_ids, target_term, target_lang);
        //res = await step_2(graph, nodes_ids, res[1], target_lang);
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
    console.log("Collecte des info du graph")
    //graph = await build_graph(graph, "Ancien Régime", "en");
    graph = await build_graph_event(graph, "Ancien Régime", "en");
    
    console.log("correction des tailles des noeuds")
    graph = resize_graph(graph);
    // load the graph
    console.log("chargement du graph")
    s.graph.read(graph);
    // draw the graph
    console.log("dessin du graph")
    s.refresh();
    // launch force-atlas for 1sec
    console.log("calcul des position des noeuds")
    s.startForceAtlas2();
    window.setTimeout(function() {s.killForceAtlas2()}, 5000);
    console.log("c'est finito")
}

main(); 