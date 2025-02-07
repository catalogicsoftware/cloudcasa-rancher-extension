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

## Testing Installation
You want to test your extension installation process before creating a release. To do this you can use the Developer Load feature built right into Rancher. 

### Using Developer Load
1) Instructions for Locally Testing the Extension Using the Developer Load Feature:
2) Another way to locally test the extension is by utilizing the "Developer Load" feature. This can be enabled by navigating to your user "Preferences" page. To do this, click the user icon in the top right corner of the page and select "Preferences."
3) Once the page loads, check the "Enable Extension Developer Features" checkbox and select it.
4) Next, go to the Extensions page, open the dropdown, and select the "Developer Load" option.
5) To prepare the repository, first clone the repository at the release tag you want to use. In this example, we are using tag 0.1.3.
6) If you have not set up the development environment, it is recommended to follow the "Development" section in this README first.
7) Once the repository is cloned and your development environment is set up, run the command: `yarn build-pkgs cloud-casa-extension`.
8) After the build is complete, run the following command: `yarn serve-pkgs`.
9) Now that the extension is being served, head over to Rancher where you have the "Developer Load" page open, and paste the following command into the "Extension URL" text input field: `http://127.0.0.1:4500/cloud-casa-extension-0.1.3/cloud-casa-extension-0.1.3.umd.min.js`.
10) Then, enter `cloud-casa-extension-0.1.3` into the "Extension Module Name" text input field if it does not autofill.
11) Click the "Load" button in the bottom right corner of the modal.
12) You should see a success message, and the extension icon will automatically appear in the bottom left of the Rancher navigation sidebar.
