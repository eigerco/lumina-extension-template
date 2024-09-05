import init, { NodeClient, NodeConfig, Network } from "lumina-node-wasm";
import init_worker from './worker.js'

// must be called before using any of the functionality imported from wasm
await init();

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#data_cloning_algorithm
// Chrom* uses JSON serialisation algoritm for messges sent over runtime.Port, which strips keys with a value of `undefined`.
// This mangles some of lumina responses, e.g. successful start node response is `{ NodeStarted: { Ok : undefined } }`, which
// then becomes `{ NodeStarted: {} }`. 
// Thankfully, replacing `undefined` with `null` works as a workaround, since we don't care about key value anyway
function sanitiseMessage(obj) {
	let keys = [ ...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj) ];	
	for (const key of keys) {
		const value = obj[key];
		const type = typeof value;
		if (type === "object" && value !== null) {
			sanitiseMessage(value);
		} else if (type === "undefined") {
			obj[key] = null;
		}
	}
}

function handleMessage(request, sender, sendResponse) {
	console.log(request);
	let config = self.NodeConfig.default();
	self.lumina.start(config);
	return true;
}

// popup -(runtime.connect)-> background -(MessageChannel)-> Worker
function handleConnect(port) {
	console.log("client connected")
	// we aren't allowed to transfer the runtime.Port we've received to worker
	// so we patch the connection through using MessageChannel
	let channel = new MessageChannel();
	port.onMessage.addListener((message) => {
		console.debug('forwarding to worker: ', message);
		channel.port1.postMessage(message);
	});
	channel.port1.onmessage = (original_message) => {
		// data field isn't considered own property of MessageEvent (but is inherited from Event),
		// so chrome's json clone will ommit this field. Hand craft the message with expected structure as a workaround.
		let message = { data: original_message.data };
		sanitiseMessage(message);
		console.debug("forwarding from worker: ", message);
		port.postMessage(message);
	};

	// post message with a transfer of a newly created port
	self.lumina_worker.postMessage(undefined, [channel.port2]);
}

self.chrome.runtime.onConnect.addListener(handleConnect);

// keep it as variable in self, so that we can play around with it on the background page of the extension
self.lumina_worker = await init_worker();
