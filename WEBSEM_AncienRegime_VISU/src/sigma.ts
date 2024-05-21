/**
 * This is a minimal example of sigma. You can use it as a base to write new
 * examples, or reproducible test cases for new issues, for instance.
 */
 import Graph from "graphology";
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

 
// Initialize the graph object with data
const graph = new Graph();
//graph.import(data);

await build_graph(graph);

console.log("mais bordel")

// Retrieve some useful DOM elements:
const container = document.getElementById("sigma-container") as HTMLElement;

/** instantiate sigma into the container **/

const renderer = new Sigma(graph, container, {
    allowInvalidContainer: true,
    defaultEdgeType: "curve",
    edgeProgramClasses: {
      curve: EdgeCurveProgram,
    },
  });


//const layout = new NoverlapLayout(graph, {maxIterations : 50});

const layout = new FA2Layout(graph, {
    settings: {
        gravity: 0.0001,
        "adjustSizes":false
    }
});


// // To start the layout
layout.start();
setTimeout(() => {
    // To stop the layout
    layout.stop();
}, 15000);


// // To kill the layout and release attached memory
// layout.kill();

// // Assess whether the layout is currently running
// layout.isRunning();


//const positions = circular(graph, {scale: 300});

// To directly assign the positions to the nodes:
//circular.assign(graph);




renderer.on('enterNode', (e) => {
    graph.forEachEdge(edge => { 
        if(graph.target(edge) === e.node || graph.source(edge) === e.node) {
            console.log("on est la")
            graph.setEdgeAttribute(edge, 'size', EDGE_SIZE_VARIANT);
            graph.setEdgeAttribute(edge, 'color', EDGE_COLOR_VARIANT);
        }
    })
})

renderer.on('leaveNode', (e) => {
    graph.forEachEdge(edge => { 
        if(graph.target(edge) === e.node || graph.source(edge) === e.node) {
            console.log("on est la")
            graph.setEdgeAttribute(edge, 'size', EDGE_SIZE_DEFAULT);
            graph.setEdgeAttribute(edge, 'color', EDGE_COLOR);
        }
    })
})

renderer.on('clickNode', (e) => {
    window.open(e.node, '_blank').focus();
})