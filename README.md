# Live_Data_Access
Qlik Sense Live Data Access permit you to access live data in your application

## Installation and setup

### Service
1. Make sure you have a recent version of [Node.js](https://nodejs.org) installed. Node 10.15.0 was used during development of the app data access.
2. [Clone the GitHub repository](https://github.com/caallard/Live_Data_Access.git) to local disk, or download and extract the [ZIP:ed repo](https://github.com/caallard/Live_Data_Access/archive/master.zip) from GitHub.
3. From within the directory where you placed the Live_Data_Access/LiveData_Service files, run 

    `npm i` 
    
4. Once the various dependencies have downloaded, copy the ./config/rename-default.json file to ./config/default.json
5. Edit default.json as needed, using paths etc for your local system

### Extension
Qlik Sense desktop 

  copy all files in extensions folder (i.e.  C:\Users\<username>\Documents\Qlik\Sense\Extensions).

Qlik Sense Server
  
  See instructions <a href="http://help.qlik.com/en-US/sense/February2019/Subsystems/ManagementConsole/Content/Sense_QMC/import-extensions.htm">Importing extensions</a>

## Usage
Start the service by running:

`node index.js` 

1. The service create a websocket server at **http://[servername]:8000/[serviceName]** . The data will be accessed by the extension.
2. Add the extension to your Qlik Sense application and configure it.

## Links & references


