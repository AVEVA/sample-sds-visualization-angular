# Sequential Data Store Angular Visualization Sample

| :loudspeaker: **Notice**: Samples have been updated to reflect that they work on AVEVA Data Hub. The samples also work on OSIsoft Cloud Services unless otherwise noted. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

**Version:** 1.1.3

[![Build Status](https://dev.azure.com/osieng/engineering/_apis/build/status/product-readiness/SDS/aveva.sample-sds-visualization-angular?branchName=main)](https://dev.azure.com/osieng/engineering/_build/latest?definitionId=2686&branchName=main)

**WARNING:** The web server used in this sample is intended for use in testing or debugging sample applications locally. It has not been reviewed for security issues.

## Prerequisites

- [NodeJS and NPM](https://nodejs.org/en/)
- [Angular CLI](https://cli.angular.io/) (`npm install -g @angular/cli`)
- A modern, evergreen browser, such as the latest version of [Google Chrome](https://www.google.com/chrome/), [Mozilla Firefox](https://www.mozilla.org/firefox/), or [Microsoft Edge](https://www.microsoft.com/edge)

This application will use local port 4200 by default.

**Note: This sample application is hosted on HTTP. This is not secure. You should use a certificate and HTTPS.**

This sample was developed using Node version 12.16.1.

## Configuring the sample

Before running the sample, you must first configure the `appsettings.json` file. The [appsettings.placeholder.json](src/app/appsettings.placeholder.json) file should be renamed to `appsettings.json`, and configured. This repository's `.gitignore` rules should prevent this file from ever being checked in to any fork or branch, to ensure sensitive information is not compromised.

Next, complete the configuration file for one of the following.

### AVEVA Data Hub

Before configuring the sample for ADH, you must first create an Authorization Code Client for use with the sample. This Authorization Code Client must contain `http://localhost:4200` in the list of RedirectUris.

- `Resource`: This can usually be left as the default of `https://uswe.datahub.connect.aveva.com`. This URL is only used for authentication and querying the list of namespaces; if a namespace is in another region the application will use the URL of the namespace.
- `TenantId`: If you are unsure what GUID to use, this is part of the Full Path in the API Console of AVEVA Data Hub, like `Tenants/{TenantId}/Namespaces`.
- `ApiVersion`: This should usually be left as the default of `v1`.
- `ClientId`: The ID of the Authorization Code Client that was created for this sample.

### Edge Data Store

Note that this sample is able to connect to a local Edge Data Store only; connections to remote Edge Data Store instances are not possible.

- `Resource`: By default, this should be `http://localhost:5590`, although the port number should match the port number that is used by Edge Data Store.
- `TenantId`: This must be set to `default`.
- `ApiVersion`: This should be left as the default, `v1`.
- `ClientId`: This field is not used when connecting to EDS.

## Running the sample

1. Open a command line in the project folder
1. Install dependencies, using `npm ci`
1. Run the sample, using `npm start`
1. Open a browser, and navigate to `http://localhost:4200`
1. Choose a namespace, then choose a stream, then click 'Add'
1. If desired, choose a number of events and a refresh rate
1. The latest x number of events will be graphed in the chart

## Running the tests

1. Open a command line in the project folder
1. Install dependencies, using `npm ci`
1. Run the tests, using `npm test` (To run the tests only once, use `npm test -- --watch-false`)
1. The tests will report the amount of code coverage in the `coverage` folder and log results to the `results` folder

---

For the main ADH page [ReadMe](https://github.com/osisoft/OSI-Samples-OCS)  
For the main samples page [ReadMe](https://github.com/osisoft/OSI-Samples)
