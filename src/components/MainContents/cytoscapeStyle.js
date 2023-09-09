export const stylesheet = [
   {
      selector: "node",
      style: {
         shape: "rectangle",
      },
   },
   {
      selector: "node[label]",
      style: {
         label: "data(label)",
      },
   },
   {
      selector: "node.highlight",
      style: {
         height: 45,
         width: 45,
         "border-color": "#ed553b",
         "border-width": 3,
         "background-opacity": 1,
      },
   },
   {
      selector: "node.size-sm",
      style: {
         height: 20,
         width: 20,
      },
   },
   {
      selector: "node.size-lg",
      style: {
         height: 45,
         width: 45,
      },
   },
   {
      selector: "node.size-xlg",
      style: {
         height: 60,
         width: 60,
      },
   },
   {
      selector: "node.size-xxlg",
      style: {
         height: 80,
         width: 80,
      },
   },
   {
      selector: "node.size-4xlg",
      style: {
         height: 120,
         width: 120,
      },
   },
   {
      selector: "node.size-xxxlg-rect",
      style: {
         height: 80,
         width: 140,
      },
   },
   {
      selector: "node.labelBottom",
      style: {
         "text-valign": "bottom",
      },
   },
   {
      selector: "node.labelRight",
      style: {
         "text-halign": "right",
         "text-valign": "center",
      },
   },
   {
      selector: "node.labelLeft",
      style: {
         "text-halign": "left",
         "text-valign": "center",
      },
   },
   {
      selector: "node.default",
      style: {
         shape: "ellipse",
      },
   },
   {
      selector: "node.storage",
      style: {
         "background-fit": "cover",
         "background-image": `${process.env.PUBLIC_URL}/assets/storage.png`,
         "background-opacity": 0,
      },
   },
   {
      selector: "node.l3vpn",
      style: {
         "background-fit": "contain",
         "background-image": `${process.env.PUBLIC_URL}/assets/l3vpn.png`,
         "background-opacity": 0,
      },
   },
   {
      selector: "node.router",
      style: {
         "background-fit": "cover",
         "background-image": `${process.env.PUBLIC_URL}/assets/router.png`,
         "background-opacity": 0,
      },
   },
   {
      selector: "node.apic",
      style: {
         "background-fit": "cover",
         "background-image": `${process.env.PUBLIC_URL}/assets/apic.png`,
         "background-opacity": 0,
      },
   },
   {
      selector: "node.antenna",
      style: {
         "background-fit": "cover",
         "background-image": `${process.env.PUBLIC_URL}/assets/antenna.png`,
         "background-opacity": 0,
      },
   },
   {
      selector: "node.dc",
      style: {
         "background-fit": "cover",
         "background-image": `${process.env.PUBLIC_URL}/assets/dc.png`,
         "background-opacity": 0,
      },
   },
   {
      selector: "edge",
      style: {
         width: 2,
         "line-color": "#007cad",
         "text-background-color": "#888",
         "text-background-shape": "round-rectangle",
         "text-background-padding": "4px",
         "text-background-opacity": "0.7",
         "text-rotation": "autorotate",
         color: "white",
      },
   },
   {
      selector: "edge[label]",
      style: {
         label: "data(label)",
      },
   },
   {
      selector: "edge.highlight",
      style: {
         width: 4,
         "line-color": "#ed553b",
      },
   },
   {
      selector: "edge.dashed",
      style: {
         "line-style": "dashed",
      },
   },
   {
      selector: "edge.curve-multiple",
      style: {
         "curve-style": "bezier",
         "control-point-step-size": "60",
      },
   },
   {
      selector: "edge.curve-single",
      style: {
         "curve-style": "unbundled-bezier",
      },
   },
   {
      selector: "edge.curve-single.curve-cw",
      style: {
         "control-point-distance": "-40",
      },
   },
   {
      selector: "edge.curve-single.curve-ccw",
      style: {
         "control-point-distance": "40",
      },
   },
];
