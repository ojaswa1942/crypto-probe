import pickle

import pandas as pd
import numpy as np

import matplotlib.pyplot as plt 

from sklearn.metrics import roc_auc_score, confusion_matrix
from sklearn.preprocessing import MinMaxScaler

from sklearn.model_selection import KFold


def load_dictionary(file_path):
    """
    Loads a categorical variable dictionary that was saved in pickle format.
    """
    with open(file_path, "rb") as dictionary_file:
        return pickle.load(dictionary_file)

def extract_experiment_data(target, filter_feature_categories=None):
    """
    Extracts a tuple of data for machine learning experiments from a dataset:
    - address list
    - feature 2-dimensional array
    - binary label array
    - multi-class label array
    - scikit-learn scaler
    - list of feature names corresponding to the feature matrix

    Arguments:
    target -- pandas dataframe to extract the data
    feature_categories -- list containing "transaction", "source code" or "fund flow";
        if None, all feature categories will be used
    """
    features_metadata = pd.read_csv("app/dataset-metadata.csv")

    if filter_feature_categories is not None:
        features_metadata = features_metadata[features_metadata.category.isin(filter_feature_categories)]

    columns_to_scale = []
    other_columns = []

    target_columns = set(target.columns)

    for _, row in features_metadata.iterrows():
        if row["feature"] in target_columns:  # in case the feature was filtered out
            if row["scale"] == 1:
                columns_to_scale.append(row["feature"])
            else:
                other_columns.append(row["feature"])

    if len(columns_to_scale) > 0:
        scaler = MinMaxScaler()
        features_scaled = scaler.fit_transform(target[columns_to_scale].values)
    else:
        scaler = None
        features_scaled = None

    if len(other_columns) > 0:
        features_others = target[other_columns].values
    else:
        features_others = None

    feature_names = columns_to_scale + other_columns

    if len(feature_names) == 0:
        raise Exception("At least one column should be used.")

    if features_scaled is not None and features_others is not None:
        features = np.concatenate((features_scaled, features_others), axis=1)
    elif features_scaled is None:
        features = features_others
    elif features_others is None:
        features = features_scaled
    else:
        raise Exception("This should not happen.")

    if scaler is not None:
        print("Scaled columns:")
        for column, min_value, max_value in zip(columns_to_scale, scaler.data_min_, scaler.data_max_):
            print("{:s}: [{:.0f}, {:.0f}]".format(column, min_value, max_value))
        print()

    addresses = target.contract_address

    labels_binary = target.contract_is_honeypot.values
    labels_multi = target.contract_label_index.values

    print("Extracted values:")
    print("addresses", addresses.shape)
    print("features", features.shape)
    print("labels_binary", labels_binary.shape)
    print("labels_multi", labels_multi.shape)

    return addresses, features, labels_binary, labels_multi, scaler, feature_names