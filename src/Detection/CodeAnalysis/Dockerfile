ARG ETHEREUM_VERSION=alltools-v1.8.16
ARG SOLC_VERSION=0.4.25

FROM ethereum/client-go:${ETHEREUM_VERSION} as geth
FROM ethereum/solc:${SOLC_VERSION} as solc
FROM ubuntu:bionic

ARG NODEREPO=node_12.x

LABEL maintainer "Ojaswa Sharma <https://github.com/ojaswa1942>"

SHELL ["/bin/bash", "-c", "-l"]
RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y wget unzip python-virtualenv git build-essential software-properties-common curl pandoc python-setuptools python-pip python-dev
RUN curl -s 'https://deb.nodesource.com/gpgkey/nodesource.gpg.key' | apt-key add -
RUN apt-add-repository "deb https://deb.nodesource.com/${NODEREPO} $(lsb_release -c -s) main"
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install -y musl-dev golang-go vim bison zlib1g-dev libyaml-dev libssl-dev libgdbm-dev libreadline-dev zlib1g-dev libreadline-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev libcurl4-openssl-dev libffi-dev nodejs yarn && apt-get clean

RUN npm install npm@latest -g  && npm install n --global && n stable

# Install z3
RUN wget https://github.com/Z3Prover/z3/releases/download/z3-4.7.1/z3-4.7.1-x64-ubuntu-16.04.zip && unzip z3-4.7.1-x64-ubuntu-16.04.zip && rm z3-4.7.1-x64-ubuntu-16.04.zip && mv z3-4.7.1-x64-ubuntu-16.04/bin/* /usr/local/bin && rm -r z3-4.7.1-x64-ubuntu-16.04

# Install geth from official geth image
COPY --from=geth /usr/local/bin/evm /usr/local/bin/evm

# Install solc from official solc image
COPY --from=solc /usr/bin/solc /usr/bin/solc

# Create virtualenv
RUN virtualenv venv && source venv/bin/activate
# Upgrade pip
RUN pip install --upgrade pip 

COPY requirements.txt .
RUN pip install -r requirements.txt 

WORKDIR /root
# COPY datasets/honeypots honeypots
# COPY datasets/source_code honeypots_sources
COPY app cryptoprobe

EXPOSE 5000

ENTRYPOINT ["python", "cryptoprobe/server.py"] 
