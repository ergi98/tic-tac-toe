# Deployment Steps

### 1. Connecting to Droplet

Open the file folder containing all your SSH keys by typing the command: `cd ~/.ssh/`. Get a list of all the available keys by typing `ls -l`. 

If you find a key named `tic-tac` and another one named `tic-tac.pub` skip to step 3.

### 2. Creating the SSH key

Open a terminal and run the following command:
```
ssh-keygen
```

You will be prompted to save and name the key. Name the key `tic-tac`. Next you will be asked to create and confirm a passphrase for the key. Login to DigitalOcean and add `tic-tac.pub` to ssh keys and give access to `Tic-Tac Droplet`.

### 3. [Connect to Droplet via SSH](https://docs.digitalocean.com/products/droplets/how-to/connect-with-ssh/)

Copy the **IP Address** of the droplet. The default user is **root**.

On a terminal type the following command:
```
ssh -i [PATH_TO_TIC_TAC_SSH_KEY] [username]@[IP_ADDRESS]
```

For example:
```
ssh -i ~/.ssh/tic-tac root@10.10.10.10
```

You should be prompted to enter the passphrase of SSH *(you created this when you created the SSH key).*

### 4. [Preparing Server Environment](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04)

Install the latest version of Node. **Replace [NODE_VERSION]** with the major version your app supports. At the time of writing this document the NODE_VERSION of tic-tac-toe app is **20**.

```
cd ~
```
```
curl -fsSL https://deb.nodesource.com/setup_[NODE_VERSION].x | sudo bash -
sudo apt-get install -y nodejs
```
*To check which version of Node.js you have installed after these initial steps, type:
```node v-```*

In order for some npm packages to work (those that require compiling code from source, for example), you will need to install the build-essential package:

```
sudo apt install build-essential
```

Next let’s install PM2, a process manager for Node.js applications. PM2 makes it possible to daemonize applications so that they will run in the background as a service.

```
sudo npm install pm2@latest -g
```

### 5. Building the app

On your repo type 

```
nx build ttt-backend
````

This command will create a `dist` folder located in the root of monorepo.

After this command successfully finishes executing open the folder and navigate to `cd ./dist/apps/tic-tac-toe/`.

Zip all the contents of the `backend` folder

```
zip backend.zip backend/*
```

### 6. Transfer files to server

Open a new terminal. **Do not close the initial terminal!**

Use this command to transfer the build folder from your local PC to the server.

```
scp -i <PATH_TO_LOCAL_PRIVATE_SSH_KEY> <PATH_TO_LOCAL_FILE> <SERVER_USER@SERVER_IP_ADDRESS>:<PATH_TO_DESTINATION_FOLDER>
```

In our case the command will look like this **assuming you are at the root of the monorepo**:

```
scp -i ~/.ssh/tic-tac -r ./dist root@10.10.10.10:~/
```

You will see a `backend.zip` file in the root of your server.

```
unzip backend.zip
```

After unzipping remove the zip folder

```
rm -rf backend.zip
```

Then type the below command to rename the folder

```
mv backend ttt-backend
```

Navigate inside the folder and remove the `assets` folder

```
cd ttt-backend
rm -rf assets
```

Then run the below command to install dependencies

```
npm i --production
```




### 7. Defining `ENV` variables

On the root of the server type

```
nano ecosystem.config.js
```

Fill the file with this information:

```
module.exports = {
  apps: [{
    name: [NAME_OF_APP],
    script: "./path/to/main.js",
    env: {
      // List of env variables
      MY_ENV=test
    }
  }]
}
```

For more information refer to [these documents](https://pm2.io/docs/runtime/best-practices/environment-variables/).

### 8. Serving application using PM2

Configure a startup script to launch PM2 and its processes on server boots:

```
pm2 startup systemd
```

This command will create a `systemctl` process named `pm2-root` which will be persistent across reboots. To check the status of this process type:
```
systemctl status pm2-root
```

To start the application type the command below. It will use the config of the mentioned file to run the script specified with the defined `env` variables.

```
pm2 start ecosystem.config.js
```

After you see that the script has started running run

```
pm2 save
```

You can verify that the script is running successfully by typing

```
pm2 monit
```

### 9. [Installing NginX](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04#step-2-adjusting-the-firewall)

```
sudo apt update
sudo apt install nginx
```

After installing enable firewall

```
sudo ufw enable
```

Then run this command to enable connections on 80 (HTTP) or 443 (HTTPS) or both (FULL)

```
sudo ufw allow 'Nginx HTTPS'
```

Also allow SSH connections

```
sudo ufw allow OpenSSH
```

Navigate to `/etc/nginx/`. 

```
cd /etc/nginx/sites-available
```


There are 2 directories there that are of importance:

1. `sites-available` - This directory holds all sites that are available to expose but **not exposed**

2. `sites-enabled` - This directory holds all sites exposed to the public.


On `sites-available` type:

*For example if domain is my-app create a file named `nano my-app.com`*

```
nano [domain].com
```

```
server {
  server_name [domain] www.[domain];
  location / {
    proxy_pass http://localhost:[SERVER_PORT];
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Save the changes. What this does is configure where to route traffic coming to `/`. So this config file determines that every request coming to `http://my-app.com` is handled by the service running on `localhost` on port `SERVER_PORT`.


After doing these changes we need to symlink this file to one in `sites-enabled` so any change on this file automatically gets reflected on `sites-enabled`.

```
sudo ln -s /etc/nginx/sites-available/[domain].com /etc/nginx/sites-enabled/[domain].com
```



### 10. Certbot & HTTPS

To enable HTTPS routing on a terminal type

```
sudo apt install certbot python3-certbot-nginx
```

After installing `certbot` type

```
sudo certbot --nginx [domain].com -d www.[domain].com
```

This will generate the appropriate certificates needed for HTTPS and also alter the file created on `sites-available` with the correct config to enable HTTPS routing.
