import joblib
import pandas as pd 
from utility import *
from xgboost import XGBClassifier

def getPrediction(id):
    df = pd.read_csv('app/test.csv')
    # df = df_test[df_test['contract_address'] == id]
    honey_badger_labels = load_dictionary("app/honey_badger_labels.pickle")
    xgb_models = joblib.load('app/xgb_models')
    addresses, X, y_binary, y_multi, scaler, feature_names = extract_experiment_data(df)
    probas = np.zeros((10, y_binary.shape[0]))
    for i, xgb_model in enumerate(xgb_models):
        probas[i, :] = xgb_model.predict_proba(X)[:, 1]
    means = probas.mean(axis=0)
    stds = probas.std(axis=0)
    df["contract_label_name"] = df.contract_label_index.map(lambda index: honey_badger_labels["index_to_name"][index])
    columns_out = [
        "contract_address",
        "contract_is_honeypot",
        "contract_label_index",
        "contract_label_name",
    ]
    df_out = df[columns_out]
    df_out["predict_probability_mean"] = means
    df_out["predict_probability_std"] = stds
    df_out["contract_is_honeypot_predicted"] = means > 0.5
    # df_out.sort_values(by="predict_pr/obability_mean", ascending=False, inplace=True)
    # print(df_out)
    return df_out[df_out['contract_address'] == id]