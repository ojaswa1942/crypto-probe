FROM jjanzic/docker-python3-opencv 

RUN apt-get update && apt-get install -y python3-dev gcc \
    && rm -rf /var/lib/apt/lists/*
    
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt 

COPY app app/ 

# RUN python app/server.py

EXPOSE 5000

CMD ["python", "app/server.py", "serve"] 
