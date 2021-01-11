# Sequential Data Store Angular Visualization Sample

**Version:**: 1.0.0

[![Build Status](https://dev.azure.com/osieng/engineering/_apis/build/status/product-readiness/SDS/osisoft.sample-sds-visualization-angular?repoName=osisoft%2Fsample-sds-visualization-angular&branchName=master)](https://dev.azure.com/osieng/engineering/_build/latest?definitionId=2686&repoName=osisoft%2Fsample-sds-visualization-angular&branchName=master)

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

### OSIsoft Cloud Services

-

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

---

For the main OCS page [ReadMe](https://github.com/osisoft/OSI-Samples-OCS)  
For the main samples page on master [ReadMe](https://github.com/osisoft/OSI-Samples)
