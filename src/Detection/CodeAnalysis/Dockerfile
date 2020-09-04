FROM ubuntu:18.04

MAINTAINER Ojaswa Sharma (ojaswa1942@gmail.com)

# SHELL ["/bin/bash", "-c"]
RUN apt-get update
RUN apt-get install -y sudo wget tar unzip pandoc python-setuptools python-pip python-dev python-virtualenv git build-essential software-properties-common
# RUN add-apt-repository -y ppa:ethereum/ethereum
# RUN apt-get update

# Install z3
RUN wget https://github.com/Z3Prover/z3/releases/download/z3-4.8.8/z3-4.8.8-x64-ubuntu-16.04.zip && unzip z3-4.8.8-x64-ubuntu-16.04.zip && rm z3-4.8.8-x64-ubuntu-16.04.zip && mv z3-4.8.8-x64-ubuntu-16.04/bin/* /usr/local/bin && rm -r z3-4.8.8-x64-ubuntu-16.04

# RUN wget https://github.com/Z3Prover/z3/releases/download/z3-4.7.1/z3-4.7.1-x64-ubuntu-16.04.zip && unzip z3-4.7.1-x64-ubuntu-16.04.zip && rm z3-4.7.1-x64-ubuntu-16.04.zip && mv z3-4.7.1-x64-ubuntu-16.04/bin/* /usr/local/bin && rm -r z3-4.7.1-x64-ubuntu-16.04
