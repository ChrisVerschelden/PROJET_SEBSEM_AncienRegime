async function build_graph_event(graph, target_term, target_lang) {
    let res = await collection_of_event_step_1(graph, target_term, target_lang);
        res = await collection_of_dbpedia_ressources(res[0], res[1], target_lang)
    return graph;
}

function resize_graph(graph) {
    let new_nodes = [];
    let cpt = 0;
    for (const node of graph.nodes) {
        cpt = 0;
        for (const edge of graph.edges) { if(edge.source === node.id || edge.target === node.id) cpt++ };
        new_nodes.push({id: node.id, label: node.label + " - " + cpt, x: node.x, y: node.y, size: cpt, color: node.color});
    }
    let new_graph = {nodes: new_nodes,edges: graph.edges};
    return new_graph;
}

function prune_graph(graph, size) {
    // let cpt = 0;
    // for (let i=0; i<graph.nodes.length; i++) {
    //     cpt = 0;
    //     let edges_to_remove = [];
    //     for (let j=0; j<graph.edges.length; j++) {
    //         if(graph.edges[j].target === graph.nodes[i].id || graph.edges[j].source === graph.nodes[i].id) {cpt++; edges_to_remove.push(j)};
    //     }
    //     if(cpt < 2) {edges_to_remove.forEach(index => {graph.edges.splice(index,index)});  console.log("removed")};
    // }
    // return graph;
    let cpt = 0;
    for (let i=0; i<graph.nodes.length; i++) {
        cpt = 0;
        let node = graph.nodes[i];

        
        //console.log(graph.nodes[i])
        if(node.size == size) {
            // console.log("adios")
            // graph.nodes.splice(i, i);
            for (let j=0; j<graph.edges.length; j++) {
                if(graph.edges[j].target === graph.nodes[i].id ) {
                    console.log(graph.nodes[i]);
                    console.log(graph.edges[j])
                    graph.edges.splice(j,j)
                };
            }
        }
    }
    return graph;
}

function redraw_graph() {
    console.log("dessin du graph")
    s.draw();
}

async function main() {
    // Initialise sigma:
    graph = {nodes: [],edges: []};
    s = new Sigma(
        graph,
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
    
    console.log("Collecte des info du graph")
    graph = await build_graph_event(graph, "Ancien Régime", "en");

    console.log(graph.nodes.length)
    
    //resize the nodes of the graph
    console.log("correction des tailles des noeuds")
    graph = resize_graph(graph);
 
    //remove least significant nodes
    console.log("correction de la taille du graph prune les noeuds à moins de 3 connections")
    //graph.nodes.forEach((value, index, array) => {console.log(value.size)})
    //graph = prune_graph(graph, 1);

    // load the graph
    console.log("chargement du graph")
    s.graph.read(graph);
    // draw the graph
    console.log("dessin du graph")
    s.refresh();
    // launch force-atlas for 1sec
    console.log("calcul des positions des noeuds")
    s.startForceAtlas2();
    window.setTimeout(function() {s.killForceAtlas2()}, 5000);
    console.log("c'est finito")

    // s.bind('clickNode', (e) => {
    //     console.log(e);
    //     window.open(e.data.node.id, '_blank').focus();
    // });
    s.bind('overNode', (e) => {
        console.log("me marche pas dessus frr");
        // for (let i = 0; i < graph.edges.length; i++) {
        //     let edge = graph.edges[i];
        //     if(e.data.node.id === edge.source || e.data.node.id == edge.target) {
        //         console.log("resiste prouve que tu existe")
        //         //let new_edge = {id: graph.edges[i].id, source: graph.edges[i].source, target: graph.edges[i].target, size: 1, color: EDGE_COLOR_VARIANT,type: 't'};
        //         //graph.edges[i] = new_edge;
        //         graph.edges[i].color = EDGE_COLOR_VARIANT;
        //     }
        // }
        for (let i = 0; i < graph.nodes.length; i++) {
            let edge = graph.nodes[i];
            //console.log(e)
            if(e.data.node.id === graph.nodes[i].id) {
                console.log("resiste prouve que tu existe")
                //let new_edge = {id: graph.edges[i].id, source: graph.edges[i].source, target: graph.edges[i].target, size: 1, color: EDGE_COLOR_VARIANT,type: 't'};
                //graph.edges[i] = new_edge;
                graph.edges[i].color = EDGE_COLOR_VARIANT;
            }
        }
        redraw_graph();
    });
    // s.bind('outNode', (e) => {
    //     console.log("merci");
    // });
}


var s = null;
var graph = null;
main(); 