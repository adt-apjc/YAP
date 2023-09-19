# Working with personal assets

This README is a work in progress that summarizes the options for leveraging remote graphical in the YAP configuration.

In this example, we are running a local instance of YAP and exposing a host directory with some graphical assets in the container as public resources.

As explained in the "config-test-pictures" demo in the /YAP/src/config directory, we can refer to the graphical assets stored in the host YAP/my-public-assets directory as src='/my-assets/fileName'. For example src='/my-assets/yapping-dog.png'.

```
docker build --tag 'yap' .
docker run --name=yap -p 4000:3000 -v /Users/marumer/Documents/git/YAP/my-public-assets:/app/public/my-assets -d  yap

# I can check the logs for errors
docker logs yap -f

# We can now stop and remove the container
docker stop
docker rm
```
