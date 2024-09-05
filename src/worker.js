// wasm stack traces can be pretty long, increase the default limit
Error.stackTraceLimit = 99;

import init, { NodeWorkerWrapper, NodeClient } from "lumina-node-wasm";

export default async function init_worker() {
	return new Worker(new URL("worker.js", import.meta.url));
}

// worker expects to receive MessagePort (or similar) to receive commands over.
// Note that new clients can connect to already running node
onmessage = async (event) => { 
	let port = event.ports[0];
	if (typeof self.worker === 'undefined') {
		console.warn("Received message before worker is ready");
	}
	if (!port instanceof MessagePort) {
		console.warn("Expected port in message")
	}
	await self.worker.connect(port);
}

// make sure this code is run only inside the worker
if (typeof WorkerGlobalScope !== "undefined" && typeof self !== "undefined" 
	&& self instanceof WorkerGlobalScope) {

	await init();

	self.worker = new NodeWorkerWrapper();
	console.log("starting worker: ", self.worker);

	while (true) {
		await self.worker.poll();
	}
}
