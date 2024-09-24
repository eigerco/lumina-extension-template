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
    let networkConfig;
    let network = document.getElementById('network-chooser').value;
    if (network  === 'mainnet') {
        networkConfig = NodeConfig.default(Network.Mainnet);
    } else if (network === 'arabica') {
        networkConfig = NodeConfig.default(Network.Arabica);
    } else if (network === 'mocha') {
        networkConfig = NodeConfig.default(Network.Mocha);
    } else {
        console.error("unrecognised network ", network);
        return;
    }
    console.log("requesting connection to", networkConfig);

    [...document.getElementsByClassName('launcher')].forEach((e) => e.disabled = true);

    let started = await self.lumina.start(networkConfig);
    console.log("started:", started);

    updateStats();
})

async function updateStats() {
    if (await self.lumina.isRunning()) {
        await self.lumina.waitConnected();

        document.getElementById('status').classList.remove('hidden');

        let peerTrackerInfo = await self.lumina.peerTrackerInfo();
        document.getElementById('peers').innerText = peerTrackerInfo.num_connected_peers;
        document.getElementById('trusted-peers').innerText = peerTrackerInfo.num_connected_trusted_peers;

        let syncerInfo = await self.lumina.syncerInfo();
        console.log(syncerInfo);
        document.getElementById('network-head').innerText = syncerInfo.subjective_head;
        document.getElementById("stored-ranges").innerText = syncerInfo.stored_headers.map((range) => {
            return `${range.start}..${range.end}`;
        }).join(", ");

        setTimeout(updateStats, 1000);
    } else {
        document.getElementById('status').classList.add('hidden');

    }
}
