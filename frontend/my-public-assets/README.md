# Working with personal assets

This README summarizes the options for leveraging remote graphical in the YAP configuration.

In this example, we are running a local instance of YAP and exposing a host directory with some graphical assets in the container as public resources.

As explained in the "config-test-pictures" demo in the /YAP/frontend/src/config directory, we can refer to the graphical assets stored in the host YAP/frontend/my-public-assets directory as src='/my-assets/fileName'.
For example src='/my-assets/yapping-dog.png'.

# Add more assets

To add more assets, simply drop the files you wish to add in YAP/frontend/my-public-assets directory.
To load newly added assets, Example: src='/my-assets/filename'

# If you encounter issues with loading your assets or the local icons follow steps below.

Step 1 - make sure you are on root directory YAP when running the command

Step 2 - Use docker compose stop and rm to clean up your local environment.

```
% docker compose stop
[+] Running 1/1
 ✔ Container yap-yap-1  Stopped                                                                                                                                                                  0.2s
docker compose rm
? Going to remove yap-yap-1 Yes
[+] Running 1/0
 ✔ Container yap-yap-1  Removed

```

Step 3 - pull latest version before building YAP container

```
% git pull
remote: Enumerating objects: 15, done.
remote: Counting objects: 100% (15/15), done.
<snip>

```

Step 4 - Build and run YAP container (remove the -d to run interactively).

```
% docker compose up  -d --build
```
