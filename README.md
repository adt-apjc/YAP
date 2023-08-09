# Yet Another Presentation (YAP)
Yet Another Presentation (YAP) is a general purpose presentation tool created for interactive automation demos, easy to customise, suitable for demos when we lack an actual product to drive the experience.

YAP provides a lightweight workflow for your scripted demo, organises your API is meaningful stages and links them to an demonstrable outcome on a contextual topology.

YAP comes with a simple Hello Word demos, explaining the tool functionalities but if you want to check a real word use case, have a look to [YAP - E2E SR orchestration with NSO](http://10.76.230.29/demoPage2) that leverages this tool for transport and APIC/ACI orchestration using the NSO CFPs.

For more information, resources and roadmap check [YAP (Yet Another Presentation)](http://10.76.230.29/demoPage1).

### Prerequisite
This project has been written in Javascript using the React framework and you can run the project, as native REACT application or wrapped in as Docker container.

To run this project as native REACT application, you will need you need `Nodejs`, `npm` and `git`.
You can easily check for these prerequisites with the following two commands and assure that Nodejs runs at least version 12. 
```
% npm --version
6.14.4
% node --version
v12.10.0
```
If you decide to run as Docker container, you will need `git`, `docker-compose`, the `docker engine`.
```
$ docker --version
Docker version 19.03.13, build cd8016b6bc

$ docker-compose version
docker-compose version 1.25.5, build unknown
docker-py version: 4.4.1
CPython version: 3.6.9
OpenSSL version: OpenSSL 1.1.1  11 Sep 2018
```

IMPORTANT - If you are planning to use YAP with NSO, check [NSO and CORS preflight requests](https://wiki.cisco.com/display/APJADT/NSO+and+CORS+preflight+requests). This how-to explain explains the use of nginx proxy to support front-end programming (i.e. REACT) with Cisco NSO, that for design (security concerns) doesn't support CORDs preflight request anymore. 


### Installation as native REACT application

Step 1 - open a terminal and clone the project with Git

``` bash
git clone https://wwwin-github.cisco.com/APJ-GSP-ADT/YAP.git
```

Step 2 - change currently directory to the newly created YAP directory and use `npm install` to install the project's dependencies.

``` bash
cd YAP
npm install
```


Step 3 - Use `npm start` to start the development server that answers to the default port tcp 3000. 

``` bash
npm start
```

Step 4 - If locally installed, the server will try to open a browser on the localhost port 3000. Alternatively you can access a remote server using the server IP_address:3000 or 127.0.0.1:3000 for local installation.

### Installation as Docker container

Step 1 - open a terminal and clone the project with Git

``` bash
git clone https://wwwin-github.cisco.com/APJ-GSP-ADT/YAP.git
```

Step 2 (optional) - REACT application runs on TCP porty 3000 and docker-compose expose this port as 4000. If YAP must answer to a different TCP port, update the ports statement in docker-compose.yaml.

Step 3 - Build and run YAP container (remove the -d to run interactively).

```
docker-compose up  -d
```

### Usage

The ADT team is currently considering and prioritising accordingly the investment in documentation, please let us know if you are interested in this project.
In the mean time you can check the [INTRO TO YAP (Devnet Open Mic 4th Dec 2020) video]( https://cisco.box.com/s/h9k5r5b51ag6eibgpjhz5uxmu29n91yh).
# YAP
