// example of NodeClient showing off starting node and monitoring its syncing status

import init, { NodeClient, NodeConfig, Network } from "lumina-node-wasm";

// must be called before using any of the functionality imported from wasm
await init();

// NodeClient will send messages and expect responses over provided port.
// See background.js and worker.js to see how the commands get to the worker
let connection = chrome.runtime.connect();
self.lumina = await new NodeClient(connection);

// poll status and update UI
await updateStats();

document.getElementById('start').addEventListener('click', async (event) => {
	let network_config;
	let network = document.getElementById('network-chooser').value;
	if (network  === 'mainnet') {
		network_config = NodeConfig.default(Network.Mainnet);
	} else if (network === 'arabica') {
		network_config = NodeConfig.default(Network.Arabica);
	} else if (network === 'mocha') {
		network_config = NodeConfig.default(Network.Mocha);
	} else {
		console.error("unrecognised network ", network);
		return;
	}
	console.log("requesting connection to", network_config);

	[...document.getElementsByClassName('launcher')].forEach((e) => e.disabled = true);

	let started = await self.lumina.start(network_config);
	console.log("started:", started);

	updateStats();
})

async function updateStats() {
	if (await self.lumina.is_running()) {
		await self.lumina.wait_connected();

		document.getElementById('status').classList.remove('hidden');

		let peer_tracker_info = await self.lumina.peer_tracker_info();
		document.getElementById('peers').innerText = peer_tracker_info.num_connected_peers;
		document.getElementById('trusted-peers').innerText = peer_tracker_info.num_connected_trusted_peers;

		let syncer_info = await self.lumina.syncer_info();
		document.getElementById('network-head').innerText = syncer_info.subjective_head;
		document.getElementById("stored-ranges").innerText = syncer_info.stored_headers.map((range) => {
			return `${range.start}..${range.end}`;
		}).join(", ");

		setTimeout(updateStats, 1000);
	} else {
		document.getElementById('status').classList.add('hidden');

	}
}
