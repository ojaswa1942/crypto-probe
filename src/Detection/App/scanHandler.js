const fetch = require("node-fetch");

const CODE_WEIGHT = 0.4, ML_WEIGHT = 0.6;
// const CodeToModelLabels = {
// 	hidden_state_update: ,
// 	balance_disorder: ,
// 	hidden_transfer: ,
// 	straw_man_contract: ,
// 	skip_empty_string_literal: ,
// 	inheritance_disorder: ,
// 	uninitialised_struct: ,
// 	type_deduction_overflow: ,
// };

const handleScan = async (req, res) => {
    let contractAddresss = req.params.id;
	let codeResponse, mlResponse;

	codePromise = fetch(`http://codeanalysis:5000/${contractAddresss}`)
	.then(res => {
		if(res.status !== 200) throw new Error("Nopes");
		return res.json();
	})
	.then(res => { codeResponse = res })
	.catch(err => {
		console.log("Error occurred while Code Analysis");
		return null;
	});

	mlPromise = fetch(`http://ml:5000/${contractAddresss}`)
	.then(res => {
		if(res.status !== 200) throw new Error("Nopes");
		return res.json();
	})
	.then(res => { mlResponse = res })
	.catch(err => {
		console.log("Error occurred while ML Analysis");
		return null;
	});

	let pendingResponses = [codePromise, mlPromise];
	await Promise.allSettled(pendingResponses);



	let report = {
		contractAddresss,
		status: 200,
		reports: {
			codeAnalysis: codeResponse,
			modelAnalysis: mlResponse
		}
	};
	res.status(200).json(report);

};


module.exports = handleScan;