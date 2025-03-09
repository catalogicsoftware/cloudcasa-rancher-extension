# CloudCasa Rancher Extension 

The CloudCasa Extension is designed to facilitate seamless one-click installation and monitoring of backup statuses within the Rancher environment. This extension features a central management interface and integrated status indicators throughout the Rancher platform.

Key Features of the Current Release:

1) **CloudCasa API Key Storage:** Enter your CloudCasa API Key once to enable easy access to the Cluster Management Panel.
2) **Cluster Management Panel:** Efficiently manage your cluster list with an intuitive panel that streamlines operations.
3) **One-Click Installation of CloudCasa Agent:** Simplify the deployment process with our one-click installation feature, allowing for rapid integration of the CloudCasa agent into your cluster.
4) **Cluster Detail Page:** View recent CloudCasa jobs, check coverage status, and quickly navigate to CloudCasa cluster pages.


<p align="middle">
   <img src="https://github.com/user-attachments/assets/357760fa-86e2-415f-8081-45b028e35eb2" />
   <img src="https://github.com/user-attachments/assets/e6d4ee74-aa76-4505-bff5-461590407c85" />
</p>


# Installation

**Note that you only need to enable the Rancher Partner Extensions Repository or Manually add the repository. Doing both will cause conflicts and the extension may not work as intended.**

## Prerequisites

1) Ensure you are running Rancher version 2.10.0 or later.
2) Ensure you have access to an admin user.
3) You must have a CloudCasa account or a self-hosted installation.

## Rancher Partner Extension Repository Instructions
1) Log into the destination Rancher Management Server dashboard.
2) From the Rancher Dashboard, open the hamburger menu in the top left corner and select "Extensions."
3) If the Partner Extension Repository is not enabled there will be a prompt at the top of the page that will say "There are new extensions repositories available. To enable these repositories, click the button on the right."
4) After adding the repository the CloudCasa Rancher Extension will be available to install. 

## Manual Instructions

1) Log into the destination Rancher Management Server dashboard.
2) From the Rancher Dashboard, open the hamburger menu in the top left corner and select "Extensions."
3) Open the dropdown in the top right corner and select "Manage Repositories."
4) Click the "Create" button in the top right corner of the page.
5) On the Create Repository page, enter the following information:

   a. Name: cloudcasa-extension

   b. Select the Target "http(s) URL to an index generated by Helm" radio option.

   c. Copy the repository link `https://catalogicsoftware.github.io/cloudcasa-rancher-extension` and paste it into the "Git Repo URL" text input field.

   d. Select the "Authentication" dropdown and choose "none" if it is not already selected.

   e. Click the "Create" button in the bottom right corner of the page.

7) After being redirected to the Repository Management page, you should see the repository downloading successfully.
8) Return to the main "Extensions" page, click the "Available" tab, and then click "Install."
9) Once the installation is complete, you may need to reload the page.
10) Access the extension via the extension icon in the left sidebar.

# Support

For support, please open an issue in this repository or [Contact CloudCasa](https://cloudcasa.io/contact-us/).

# Development

If you would like to know how to develop for this Rancher Extension, see the [Development Environment Setup Guide](DEVELOPMENT.md).
