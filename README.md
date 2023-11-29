# Yet Another Presentation (YAP)

Yet Another Presentation (YAP) is a general-purpose tool created for interactive automation demos, easy to customize and suitable for demos when we lack an actual product to drive the experience.

YAP provides a lightweight workflow for your scripted demo, organizes your API in meaningful stages and links them to a verifiable outcome on a contextual topology.

As initial documentation, YAP provides a simple [Hello Word demo](<https://storage.googleapis.com/yap_hello_world/YAP%20Hello%20World%20(1.1.0).pdf>) (described in the **How to start** section below). This demo interacts with a mockup server and lets you assess tool functionalities.

Check the YAP's [Releases](https://github.com/adt-apjc/YAP/releases) section for information on new features and bug fixes.

### Prerequisite

This project has been written in TypeScript and Javascript.
For development, you should run YAP as native React and Nodejs applications but you can easily install YAP using docker compose and you will need `git`, `docker` and the `docker compose` application or plugin.

```
$ docker version
Client:
 Cloud integration: v1.0.31
 Version:           20.10.24
 <snip>

$ docker compose version
Docker Compose version v2.17.2
```

### Installation as Docker container

YAP default configuration now leverages a simple backend to proxy the API request to the remote endpoint. We have integrated this component to overcome CORS issues in real-world platforms.
To simplify the installation and comunication between frontend and backend, we suggest leveraging Docker compose.

Step 1 - open a terminal and clone the project with Git.

```bash
git clone https://github.com/adt-apjc/YAP.git
```

Step 2 (optional) - REACT application runs on TCP porty 3000 and docker-compose expose this port as 4000. If YAP must answer to a different TCP port, update the ports statement in docker-compose.yaml.

Step 3 (optional) - Step 3 (Optional) - Update REACT_APP_API_URL localhost string in the frontend/.env with the IP address of your server if you run this project on a remote server to explain to YAP frontend how to access the backend.
For example, if you host YAP in a Cisco dCloud VM, let say 198.18.134.15 IPv4 address, you can use: REACT_APP_API_URL=http://198.18.134.15:5001.

Step 4 - Build and run YAP container (remove the -d to run interactively).

```
docker compose up  -d --build
```

Step 4 (alternative) - Considering the optimised build when deploying YAP as a shared service would be a preferred option to improve performance.

The current docker-compose-prod.yaml exposes YAP on port 80 and leverages nginx to serve the application.
You can run this build version on your local YAP deployment but remember that they will take longer to build and you lose the option to map a local folter to serve your local assets.

```
docker compose -f docker-compose-prod.yaml up -d  --build
```
Note: please disregard the following message if returned by docker compose.

```
yap-backend The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested
```

### Installation in dCloud

Use YAP to orchestrate a dCloud demo by running the tool on your local machine or remotely, leveraging one of the support VMs. This section describes a remote installation on the Deployer VM, running on the 198.18.134.15 address in the CNC5.0 demo that already has Docker and git installed. The same process can be leveraged for any other VM with similar prerequisites.

To install YAP on the dCloud Deployer, SSH to the server and execute the following commands:

Step 1 - Confirm that docker is installed and running.

```
cisco@deployer:~$ docker --version
Docker version 20.10.5, build 55c4c88
```

Step 2 - install the docker compose plugin.

```
cisco@deployer:~$ sudo apt-get update
cisco@deployer:~$ sudo apt-get install docker-compose-plugin
cisco@deployer:~$ docker compose version
Docker Compose version v2.21.0
```

Step 3 - Clone YAP.

```
cisco@deployer:~$ git clone http://github.com/adt-apjc/YAP.git
Cloning into 'YAP'...
<snip>
Resolving deltas: 100% (1137/1137), done.
```

Step 4 - Update the reference to the backend IP address

```
sed -i 's/localhost/198.18.134.15/' YAP/frontend/.env
```

Step 5 - Compile and launch YAP.

```
cisco@deployer:~/YAP$ cd YAP
cisco@deployer:~/YAP$ docker compose up -d --build
```

You can now access YAP at http://198.18.134.15:4000.

### How to start

YAP starts showing the demo catalog, and if it can not access the catalog configuration file, it shows the two essential tails: My Demo and Hello World.

Click on Deploy Hello World to familiarize yourself with the tool.

![catalog](https://storage.googleapis.com/yap_hello_world/catalog.png)

-  Hello World demo describes the Yet Another Presentation tool (YAP) functionalities by orchestrating a simple project in a safe mockup environment and explains how to use the YAP functionalities. Ultimately, it will generate a live documentation of the experience [example](<https://storage.googleapis.com/yap_hello_world/YAP%20Hello%20World%20(1.1.0).pdf>).

-  After testing My Demo, we can create a new bare demo flow or import your modified version of Hello World configuration.
   We will soon provide more documentation on the catalog format and how to customize it for your experience.

### How to update YAP

Update a running YAP tool with the latest version is straightforward: pull the code with `git pull` and recompile with docker compose.

```
% git pull
remote: Enumerating objects: 15, done.
remote: Counting objects: 100% (15/15), done.
<snip>

 % docker compose up -d --build
 <snip>
 [+] Running 2\2
 ✔ Container yap-yap-frontend-1  Started
 ✔ Container yap-yap-backend-1   Started

```

### Clean up

Use docker compose stop and rm to clean up your local environment.

```
% docker compose stop
[+] Running 1/1
 ✔ Container yap-yap-1  Stopped                                                                                                                                                                  0.2s
docker compose rm
? Going to remove yap-yap-1 Yes
[+] Running 1/0
 ✔ Container yap-yap-1  Removed

```

### YAP Roadmap

YAP open issues and planned features are summarized in the repository's [issues](https://github.com/adt-apjc/YAP/issues) and [projects](https://github.com/adt-apjc/YAP/projects?query=is%3Aopen).
If you have any ideas, please comment in [YAP Idea Space](https://github.com/adt-apjc/YAP/discussions/152). For other feedback, use [chat about anything](https://github.com/adt-apjc/YAP/discussions/141).
