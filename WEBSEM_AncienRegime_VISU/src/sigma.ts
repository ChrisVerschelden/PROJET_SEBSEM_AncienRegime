/**
 * This is a minimal example of sigma. You can use it as a base to write new
 * examples, or reproducible test cases for new issues, for instance.
 */
 import Graph from "graphology";
 import random from 'graphology-layout/random';
 import { circular } from "graphology-layout";
 import forceAtlas2 from "graphology-layout-forceatlas2";
 import FA2Layout from "graphology-layout-forceatlas2/worker";
 import EdgeCurveProgram from "@sigma/edge-curve";
 import Sigma from "sigma";
 import { PlainObject } from "sigma/types";
 import { animateNodes } from "sigma/utils";
 import { build_graph } from "./builder";
 import NoverlapLayout from 'graphology-layout-noverlap/worker';
 import data from "../eurosis.json";
 import circular from 'graphology-layout/circular';
 import {EDGE_COLOR, EDGE_COLOR_VARIANT, EDGE_SIZE_DEFAULT, EDGE_SIZE_VARIANT} from "./const";

 import data from '../graph.json'

 function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

//param
var param_slider_gravity = 3
var param_slider_expansion = 1
var param_checkbox_barnesHutOptimize = false
var param_slider_barnesHutTheta = 1
var param_checkbox_adjustSizes = false

var slider_gravity = document.querySelector("#gravity");
slider_gravity.addEventListener('change', () => {
    param_slider_gravity = slider_gravity.value;
});
var slider_expansion = document.querySelector("#expansion");
slider_expansion.addEventListener('change', () => {
   param_slider_expansion = slider_expansion.value 
});
var checkbox_barnesHutOptimize = document.querySelector("#barnesHutOptimize");
checkbox_barnesHutOptimize.addEventListener('change', (e) => {
    param_checkbox_barnesHutOptimize = checkbox_barnesHutOptimize.checked
});
var slider_barnesHutTheta = document.querySelector("#barnesHutTheta");
slider_barnesHutTheta.addEventListener('change', () => {
    param_slider_barnesHutTheta = slider_barnesHutTheta.value
});
var checkbox_adjustSizes = document.querySelector("#adjustSizes");
checkbox_adjustSizes.addEventListener('change', () => {
    param_checkbox_adjustSizes = checkbox_adjustSizes.checked    
});
var update_graph = document.querySelector("#update_graph");
update_graph.addEventListener('click', () => {
    draw_graph();
});

//indicators
var graph_info = document.querySelector("#graph_info");

function draw_graph() {
    console.log("Dessins du graph basé sur les paramètres")
    let option = {}
    option["gravity"] = Math.max(0.1,param_slider_gravity);
    option["expansion"] =  0.1 + param_slider_expansion;
    option["barnesHutOptimize"] = param_checkbox_barnesHutOptimize;
    option["barnesHutTheta"] = 0.1 + param_slider_barnesHutTheta/10;
    option["adjustSizes"] = param_checkbox_adjustSizes;

    var positions = random(graph);
    var layout = new FA2Layout(graph, {
        settings: {
            ...option,
            "outboundAttractionDistribution":true
        }
    });


    //To start the layout
    layout.start();
    setTimeout(() => {
        // To stop the layout
        layout.stop();
    }, 6000);    
}

const graph = new Graph();

//set true if you want to boot from web data, false if you want to boot from graph.json
if(false) {
    // Initialize the graph object with data
    await build_graph(graph);
    //downloadObjectAsJson(graph.export(), "graph")
} else {
    // Initialize the graph object with data
    graph.import(data);
}

// Retrieve some useful DOM elements:
const container = document.getElementById("sigma-container") as HTMLElement;

//display graph info
graph_info.innerHTML = `
Graph infos :
    <p style="margin: 0px; margin-left: 10px"> ${graph.nodes().length} nodes </p><br>
    <p style="margin: 0px; margin-left: 10px"> ${graph.edges().length} edges </p>
`

/** instantiate sigma into the container **/
const renderer = new Sigma(graph, container, {
    allowInvalidContainer: true,
    defaultEdgeType: "curve",
    edgeProgramClasses: {
      curve: EdgeCurveProgram,
    },
  });

renderer.on('enterNode', (e) => {
    graph.forEachEdge(edge => { 
        if(graph.target(edge) === e.node || graph.source(edge) === e.node) {
            graph.setEdgeAttribute(edge, 'size', EDGE_SIZE_VARIANT);
            graph.setEdgeAttribute(edge, 'color', EDGE_COLOR_VARIANT);
        }
    })
})
renderer.on('leaveNode', (e) => {
    graph.forEachEdge(edge => { 
        if(graph.target(edge) === e.node || graph.source(edge) === e.node) {
            graph.setEdgeAttribute(edge, 'size', EDGE_SIZE_DEFAULT);
            graph.setEdgeAttribute(edge, 'color', EDGE_COLOR);
        }
    })
})
renderer.on('clickNode', (e) => {
    window.open(e.node, '_blank').focus();
})


draw_graph()