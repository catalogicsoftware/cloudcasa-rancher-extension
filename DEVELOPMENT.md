The current process to get things running are listed below, along with links to the the Rancher Extension/CloudCasa API documentation pages. 

## Documentation
[Rancher Extensions](https://extensions.rancher.io/)

[CloudCasa API](https://docs.cloudcasa.io/apiguide/kubebackups.html)

## Requirements

### NVM
The extensions and the Rancher Dashboard code are currently built with Node 20.

We recommend managing node versions with [nvm](https://github.com/nvm-sh/nvm).

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
cd # project directory
nvm install $(cat package.json | grep '\"node\": ' | grep -o '[0-9.]*')
```

When using nvm, you can use the following command to switch to the correct node version:

```sh
  nvm use 20
```

### Rancher
We recommend using a fresh Rancher Docker image when developing. For more details on how to set up Rancher, check the documentation out [here](https://extensions.rancher.io/extensions/next/extensions-getting-started#installing-rancher). The section 
below will just be a quick start guide. Feel free to use an existing testing instance of Rancher you may have. 

#### Install the Rancher Docker Image by running this command 

```sh
sudo docker run -d --restart=unless-stopped -p 80:80 -p 443:443 --privileged -e CATTLE_BOOTSTRAP_PASSWORD=OPTIONAL_PASSWORD_HERE rancher/rancher:v2.10-head
```

Note the the “OPTIONAL_PASSWORD_HERE" will be the password you need to bootstrap/login. The default user is `admin`.

#### Bootstrap Rancher
Rancher should be running on `http://localhost`, navigate to the url and bootstrap Rancher. 

#### CloudCasa API Key
1. Log into CloudCasa.
2. Navigate to Configuration->API Keys.
3. Click New API Key and follow the instructions. If you lose this key you will have to create a new one.
4. Add the key to the .env file in the root of this repository.

## Starting Development
1. Clone this repository.
2. Run `yarn install`.
3. Run `API=<Rancher Backend base URL> yarn dev`. (Example URL: http://localhost)
