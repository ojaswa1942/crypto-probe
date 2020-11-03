const fetch = require("node-fetch");

const handleScan = async (request, response) => {
    let contractAddresss = req.params.id;
	let codeResponse, mlResponse;

	codeResponse = fetch(`http://codeanalysis:5000/${id}`)
	.then(res => {
		if(res.status !== 200) throw new Error("Nopes");
		return res.json();
	})
	.then(res => res)
	.catch(err => {
		console.log("Error occurred while Code Analysis");
		return null;
	});

	mlResponse = fetch(`http://ml:5000/${id}`)
	.then(res => {
		if(res.status !== 200) throw new Error("Nopes");
		return res.json();
	})
	.then(res => res)
	.catch(err => {
		console.log("Error occurred while ML Analysis");
		return null;
	});

	let pendingResponses = [codeResponse, mlResponse];
	await Promise.allSettled(pendingResponses);

	console.log("yep");
	console.log(codeResponse, mlResponse);

};


module.exports = handleScan;