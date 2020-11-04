const fetch = require("node-fetch");

const CODE_WEIGHT = 0.4, ML_WEIGHT = 0.6;
const CodeToModelLabels = {
	none: 'Not Honeypot',
	undetermined: 'Cannot determine',
	hidden_state_update: 'Hidden State Update',
	balance_disorder: 'Balance Disorder',
	hidden_transfer: 'Hidden Transfer',
	straw_man_contract: 'Straw Man Contract',
	skip_empty_string_literal: 'Skip Empty String Literal',
	inheritance_disorder: 'Inheritance Disorder',
	uninitialised_struct: 'Uninitialised Struct',
	type_deduction_overflow: 'Type Deduction Overflow',
};

const sanitizeCodeResults = (results = {}) => {
	let resultObject = {
		isHoneypot: false,
		category: CodeToModelLabels.none,
		details: results,
	};

	Object.keys(CodeToModelLabels).forEach(x => {
		if(results[x] !== undefined && results[x] !== false) {
			resultObject.isHoneypot = true;
			resultObject.category = CodeToModelLabels[x];
		}
	});

	return resultObject;
}

const sanitizeModelResults = (results = {}) => {
	let resultObject = {
		isHoneypot: false,
		category: CodeToModelLabels.none,
		details: results,
	};

	if(results.contract_is_honeypot) {
		resultObject.isHoneypot = true;
		resultObject.category = results.contract_label_name;
	}

	return resultObject;
}

const handleScan = async (req, res) => {
    let contractAddresss = req.params.id;
	let codeResponse, mlResponse;

	codePromise = fetch(`http://codeanalysis:5000/${contractAddresss}`)
	.then(res => {
		if(res.status !== 200) throw new Error("Nopes");
		return res.json();
	})
	.then(res => { codeResponse = sanitizeCodeResults(res) })
	.catch(err => {
		console.log("Error occurred while Code Analysis");
		return null;
	});

	mlPromise = fetch(`http://ml:5000/${contractAddresss}`)
	.then(res => {
		if(res.status !== 200) throw new Error("Nopes");
		return res.json();
	})
	.then(res => { mlResponse = sanitizeModelResults(res[0]) })
	.catch(err => {
		console.log("Error occurred while ML Analysis");
		return null;
	});

	let pendingResponses = [codePromise, mlPromise];
	await Promise.allSettled(pendingResponses);

	let report = {
		address: contractAddresss,
		isHoneypot: null,
		category: CodeToModelLabels.undetermined,
		reports: {
			codeAnalysis: codeResponse,
			modelAnalysis: mlResponse
		}
	};

	// if results were obtained from both and positive
	if(mlResponse && codeResponse) {
		if(mlResponse.isHoneypot && codeResponse.isHoneypot) {
			report.isHoneypot = true;
			report.category = mlResponse.category;
		} else if (mlResponse.isHoneypot && !codeResponse.isHoneypot) {
			if(mlResponse.details.predict_probability_mean > 0.04) {
				report.isHoneypot = true;
				report.category = mlResponse.category;
			} else {
				report.isHoneypot = false;
				report.category = CodeToModelLabels.none;
			}
		} else if (!mlResponse.isHoneypot && codeResponse.isHoneypot) {
			report.isHoneypot = "Likely";
			report.category = codeResponse.category;
		}
		else {
			report.isHoneypot = false;
			report.category = CodeToModelLabels.none;
		}
	}
	// if results obtained only from ml 
	else if (!codeResponse && mlResponse) {
		report.isHoneypot = mlResponse.isHoneypot;
		report.category = mlResponse.category;
	} else if (codeResponse && !mlResponse) {
		report.isHoneypot = codeResponse.isHoneypot;
		report.category = codeResponse.category;
	}

	res.status(200).json(report);
};


module.exports = handleScan;