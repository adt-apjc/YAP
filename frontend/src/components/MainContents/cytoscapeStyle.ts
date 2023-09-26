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
      selector: "node.iconLink",
      style: { "background-fit": "contain", "background-image": "data(imglink)", "background-opacity": 0 },
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
      selector: "node.labelCenter",
      style: {
         "text-halign": "center",
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
      selector: "node.virtual_router",
      style: { "background-fit": "contain", "background-image": "/assets/virtual_router.png", "background-opacity": 0 },
   },
   {
      selector: "node.switch",
      style: { "background-fit": "contain", "background-image": "/assets/switch.png", "background-opacity": 0 },
   },
   {
      selector: "node.layer3_switch",
      style: { "background-fit": "contain", "background-image": "/assets/layer3_switch.png", "background-opacity": 0 },
   },
   {
      selector: "node.generic_gateway",
      style: { "background-fit": "contain", "background-image": "/assets/generic_gateway.png", "background-opacity": 0 },
   },
   {
      selector: "node.firewall",
      style: { "background-fit": "contain", "background-image": "/assets/firewall.png", "background-opacity": 0 },
   },
   {
      selector: "node.wireless_lan_controller",
      style: { "background-fit": "contain", "background-image": "/assets/wireless_lan_controller.png", "background-opacity": 0 },
   },
   {
      selector: "node.wireless_lan_controller",
      style: { "background-fit": "contain", "background-image": "/assets/wireless_lan_controller.png", "background-opacity": 0 },
   },
   {
      selector: "node.dc_networking_manager",
      style: { "background-fit": "contain", "background-image": "/assets/dc_networking_manager.png", "background-opacity": 0 },
   },
   {
      selector: "node.access_point",
      style: { "background-fit": "contain", "background-image": "/assets/access_point.png", "background-opacity": 0 },
   },
   {
      selector: "node.server",
      style: { "background-fit": "contain", "background-image": "/assets/server.png", "background-opacity": 0 },
   },
   {
      selector: "node.storage_server",
      style: { "background-fit": "contain", "background-image": "/assets/storage_server.png", "background-opacity": 0 },
   },
   {
      selector: "node.optical_transport",
      style: { "background-fit": "contain", "background-image": "/assets/optical_transport.png", "background-opacity": 0 },
   },
   {
      selector: "node.terminal",
      style: { "background-fit": "contain", "background-image": "/assets/terminal.png", "background-opacity": 0 },
   },
   {
      selector: "node.generic_building",
      style: { "background-fit": "contain", "background-image": "/assets/generic_building.png", "background-opacity": 0 },
   },
   {
      selector: "node.cloud",
      style: { "background-fit": "cover", "background-image": "/assets/cloud.png", "background-opacity": 0 },
   },
   {
      selector: "node.satellite",
      style: { "background-fit": "contain", "background-image": "/assets/satellite.png", "background-opacity": 0 },
   },
   {
      selector: "node.satellite_dish",
      style: { "background-fit": "contain", "background-image": "/assets/satellite_dish.png", "background-opacity": 0 },
   },
   {
      selector: "node.storage",
      style: { "background-fit": "contain", "background-image": "/assets/storage.png", "background-opacity": 0 },
   },
   {
      selector: "node.upf",
      style: { "background-fit": "contain", "background-image": "/assets/upf.png", "background-opacity": 0 },
   },
   {
      selector: "node.l3vpn",
      style: { "background-fit": "contain", "background-image": "/assets/l3vpn.png", "background-opacity": 0 },
   },
   {
      selector: "node.router",
      style: { "background-fit": "contain", "background-image": "/assets/router.png", "background-opacity": 0 },
   },
   {
      selector: "node.apic",
      style: { "background-fit": "contain", "background-image": "/assets/apic.png", "background-opacity": 0 },
   },
   {
      selector: "node.contract",
      style: { "background-fit": "contain", "background-image": "/assets/contract.png", "background-opacity": 0 },
   },
   {
      selector: "node.epg",
      style: { "background-fit": "contain", "background-image": "/assets/epg.png", "background-opacity": 0 },
   },
   {
      selector: "node.radio_tower",
      style: {
         "background-fit": "cover",
         "background-image": "/assets/radio_tower.png",
         "background-opacity": 0,
      },
   },
   {
      selector: "node.dc",
      style: {
         "background-fit": "cover",
         "background-image": "/assets/dc.png",
         "background-opacity": 0,
      },
   },
   {
      selector: "node.dc1",
      style: {
         "background-fit": "cover",
         "background-image": "/assets/dc1.png",
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
