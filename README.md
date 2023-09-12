# Yet Another Presentation (YAP)

Yet Another Presentation (YAP) is a general-purpose tool created for interactive automation demos, easy to customize and suitable for demos when we lack an actual product to drive the experience.

YAP provides a lightweight workflow for your scripted demo, organizes your API in meaningful stages and links them to a verifiable outcome on a contextual topology.

YAP comes with a simple Hello Word demo, leveraging an API mockup server hosted in Google Cloud, and we are preparing more documentation and demos to share.

### Prerequisite

This project has been written in Javascript using the React framework, and you can run the project as native REACT application or wrapped in a Docker container.

To run this project as a native REACT application, you need `Nodejs`, `npm` and `git`.
You can quickly check for these prerequisites with the following two commands and ensure that Nodejs runs at least version 12.

```
% npm --version
8.5.0
% node --version
v16.14.2
```

If you decide to run as a Docker container, you will need `git`, `docker-compose`, and the `docker engine`.

```
$ docker --version
Docker version 20.10.24, build 297e128

$ docker-compose version
Docker Compose version v2.17.2
```

### Installation as native REACT application

Step 1 - open a terminal and clone the project with Git

```bash
git clone https://github.com/adt-apjc/YAP.git
```

Step 2 - change currently directory to the newly created YAP directory and use `npm install` to install the project's dependencies.

```bash
cd YAP
npm install
```

Step 3 - Use `npm start` to start the development server that answers to the default port tcp 3000.

```bash
npm start
```

Step 4 - If locally installed, the server will try to open a browser on the localhost port 3000. Alternatively you can access a remote server using the server IP_address:3000 or 127.0.0.1:3000 for local installation.

### Installation as Docker container

Step 1 - open a terminal and clone the project with Git

```bash
git clone https://github.com/adt-apjc/YAP.git
```

Step 2 (optional) - REACT application runs on TCP porty 3000 and docker-compose expose this port as 80. If YAP must answer to a different TCP port, update the ports statement in docker-compose.yaml.

Step 3 - Build and run YAP container (remove the -d to run interactively).

```
docker-compose up  -d
```

### YAP orchestrating Cisco NSO

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
