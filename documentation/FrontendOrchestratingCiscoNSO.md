### Orchestrating Cisco NSO from a frontend applicaiton

Orchestrating NSO directly from a frontend application requires support for answering the CORDS preflight requests.

#### YAP is now supporting a light weight backend to overcome this challenge, and you can discard this document.

CORDS preflight is a typical pattern in web programming to validate the support of some CORDs requests on servers that may have been designed without permission for these scenarios and behave abnormally.

Cisco NSO was supporting CORS preflight, but it was disabled (NSO versions 5.3, 5.2.2, 5.1.3, 4.7.6, 4.6.5) due to the possibility of unauthenticated calls poking paths for existence. For more details, check https://community.cisco.com/t5/nso-developer-hub-discussions/ncs-5-3-preflight-request-unauthorized-http401/td-p/4089183 conversation.

Missing support for preflight is not a problem if you use something like Postman (that doesn't implement CORS) or backend programming (i.e. NodeJS that doesn't implement preflight options) to issue your Restconf commands. Still, it is an issue in YAP, a front-end application implemented in REACT, but we are considering adding a light backend.

While waiting for the backend support, you can add an Nginx proxy to answer the preflight request before forwarding the request to the NSO server.

Using Docker and docker-compose, you can leverage the following information to run the nginx proxy.

Add these three files to your server: docker-compose.yaml, Dockerfile and nginx.conf.

Docker-compose orchestrates the project so that you can build and run nginx in the background with a simple "docker-compose up -d".

This configuration describes the TCP mapping for an NSO CFS/RFS configuration using two NSO servers (i.e. 38080 proxy exposed port and 8080 as the actual NSO server TCP port for the CFS).

Note: Please remember that yaml requires proper indentation, as in this example, two spaces for each sub-command

```
$ cat docker-compose.yaml

version: "2"
services:
  reverseproxy:
    build: .
    ports:
      - 38080:8080
      - 38081:8081
    restart: always
```

The Dockerfile describes how to build the nginx server directly from the Docker nginx Alpine image and copy its configuration file that the nginx entry point will use.

```
$ cat Dockerfile

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf

```

Finally, the nginx.conf file describes the nginx configuration.

In this example, it creates proxy servers for two NSO instances (CFS/RFS) answering on different TCP ports (i.e. 8080 and 8081).

An alternative configuration for this scenario is to use a single proxy server but change the location string (i.e. from a typical /nso/ to /nso-cfs/ and /nso-rfs/) to filter the request appropriately. Of course, this means changing the Restconf paths to accommodate the proxy.

Please update the project server IP address, TCP port (in the http section) and actual NSO TCP port if it differs from standard 8080 (in the server section like we do for the RFS server answering on port 8081).

```
$ cat nginx.conf

worker_processes 1;
events { worker_connections 1024; }
http {
    sendfile on;
    upstream cfs {
        server <your IP>:18080;
    }
    upstream rfs {
        server <your IP>:18081;
    }

    server {
        listen 8080;
        location /nso/ {
            # Preflight Request
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' '*';
                add_header 'Access-Control-Allow-Methods' 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS';
                add_header 'Access-Control-Allow-Headers' '*';
                # Tell client that this pre-flight info is valid for 20 days
                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain; charset=utf-8';
                add_header 'Content-Length' 0;
                return 204;
            }
            rewrite ^/nso/(.*)$ /$1 break;
            proxy_pass         http://cfs;
            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
        }
    }

    server {
        listen 8081;
        location /nso/ {
            # Preflight Request
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' '*';
                add_header 'Access-Control-Allow-Methods' 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS';
                add_header 'Access-Control-Allow-Headers' '*';
                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain; charset=utf-8';
                add_header 'Content-Length' 0;
                return 204;
            }

            rewrite ^/nso/(.*)$ /$1 break;
            proxy_pass         http://rfs;
            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
        }
    }
}
```
