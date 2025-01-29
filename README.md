# CloudCasa Rancher Extension 

This extension is built to allow CloudCasa one-click-install and backup statuses. The extension consists of the main extension page and status integration throughout Rancher. 

## Installation

### Prerequisites
1) Ensure you are running the latest Rancher version 2.10.
2) Ensure you have access to an admin user. 

### Add a Repository
1) Log into Rancher.
2) From the Rancher Dashboard, open the hamburger menu in the top left corner, and select "Extensions".
3) Open the dropdown in the top right corner and select "Manage Repositories"
4) Click the "Create" Button on the top right of the page.
5) On the Create Repository page enter the following information:
   a. Name: cloud-casa-extension
   b. Select the "Git repository containing Helm chart or cluster template definitions" radio option
   c. The next few steps are very important, if you are on a local rancher server for development you will want to use ssh, if you are on a production server with a valid ssl certificate for your domain you can use either https or ssh authentication. !WARNING! by entering your credientials any admin will be able to use these secrets to authenticate to repositories, its best to use a general user for your organization or personal repos. For brevities sake, we wil be using the ssh method in this example.
   d. Copy the repository link `git@github.com:catalogicsoftware/cloudcasa-rancher-extension.git` and input it into the "Index URL" text input field.
   e. Copy your GitHub public and private it key into the Public and Private Key text input fields respectively.
   f. Click the "Create" button in the bottom right of the page.
 6. After being redirected to the Repository management page you should see the repository successfully download. You can now go back to the main "Extension" page, click the "Available" tab, and click "Install".
 7. After the install is complete you may need to reload the page to see the extension appear in the left side bar.

### Using Developer Load
1) Another way to locally test the extension is to utilize the "Developer Load" feature. This can be enabled by going to your user "Preferences" page. This can be achieved by clicking the user icon in the top right of the page, and selecting Preferences.
2) Once the page loads fine the `Enable Extension developer features` checkbox and select it.
3) Now go to the extensions page and select the dropdown and select "Developer Load" option.
4) Lets prepare the repository, first clone the repository on the release tag you want to use. In this example were using tag `0.1.3`.
5) If you have not set up the development environment, its recommended to follow the "Development" section in this readme first.
6) Once the repository is cloned and your development enviroment is setup, run `yarn build cloud-casa-extension`
7) Once the build is complete, run the command `yarn serve-pkgs`.
8) Now that the extension is being served head over to Rancher where you have the "Developer Load" page open, and paste in the the following command into the "Extension URL" text input field.`http://127.0.0.1:4500/cloud-casa-extension-0.1.3/cloud-casa-extension-0.1.3.umd.min.js
`
9) Then enter `cloud-casa-extension-0.1.3` into the "Extension module name" text input field if it doesn't autofill.
10) Click the "Load" button in the bottom right of the modal.
11) You should see a success message and the extension icon will automatically appear in the bottom left of Rancher navigation sidebar. 

# Development
This Rancher Extension is under heavy development. The current process to get things running are listed below, along with links to the the Rancher Extension/CloudCasa API documentation pages. 

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
