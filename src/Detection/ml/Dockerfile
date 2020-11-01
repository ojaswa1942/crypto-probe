FROM jjanzic/docker-python3-opencv 

RUN apt-get update && apt-get install -y python3-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt 

COPY app app/ 

EXPOSE 5000

ENTRYPOINT ["python", "app/server.py"] 
