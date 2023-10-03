# Working with personal assets

This README summarizes the options for leveraging remote graphical in the YAP configuration.

In this example, we are running a local instance of YAP and exposing a host directory with some graphical assets in the container as public resources.

As explained in the "config-test-pictures" demo in the /YAP/frontend/src/config directory, we can refer to the graphical assets stored in the host YAP/frontend/my-public-assets directory as src='/assets/fileName'.
For example src='/assets/yapping-dog.png'.

# Add more assets

To add more assets, simply drop the files you wish to add in YAP/frontend/my-public-assets directory.
and then re-build and run YAP container

Step 1 - make sure you are on root directory YAP when running the command

Step 2 - Build and run YAP container (remove the -d to run interactively).

```

docker compose up  -d --build

```
