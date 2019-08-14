var WebSocketServer = require('websocket').server;
var http = require('http');
var config = require('config');
var request = require('sync-request');



function getDataFromSource(service){
	var rawData = request('GET', service.url).getBody().toString();
	var fulldata = JSON.parse(rawData);
	var returnValue = {};
	if (service.config.path!=''){
		fulldata = fulldata[service.config.path];
	}
	//console.log(fulldata);
	//console.log(JSON.parse(getUrl("http://tfe-opendata.com/api/v1/vehicle_locations")));
	
	
	returnValue.currentData=Array();
	returnValue.maxId=0;
	fulldata.forEach(function(object) {
		var currentObject={};
		currentObject['id']=parseInt(object[service.config.id]);
		Object.keys(service.config.fields).map( function(configFieldKey, index) {
			//currentObject[configFieldKey+'Value']=object[service.config.fields[configFieldKey]];
			currentObject[configFieldKey+'Value']=parseFloat(object[service.config.fields[configFieldKey]]);
		}); 
		returnValue.currentData.push(currentObject);
		//console.log(object[service.config.id]);
		//console.log(currentObject['id']);
		if(currentObject['id']>returnValue.maxId){
			returnValue.maxId=currentObject['id'];
		}
	});
	
	console.log(returnValue.currentData);
	console.log('-->' + returnValue.maxId + '<--');
	
	//pick(id,virtualFieldValue1, virtualFieldValue2, virtualFieldValue3, virtualFieldValue4, virtualFieldValue5, virtualFieldValue6)
	returnValue.FieldConfig={};
	Object.keys(service.config.fields).map( function(configFieldKey, index) {
		var field='pick(id';
		for(var i=1; i<=returnValue.maxId; i++){
			field += ','+configFieldKey+'Value'+i;
		}
		field += ')';
		returnValue.FieldConfig[configFieldKey]=field;
	}); 
	
	//console.log(returnValue.FieldConfig);
	
	return returnValue;
}







//var fulldata=[[1,10],[2,50],[3,30],[4,30],[5,30],[6,30]];
/*var fulldata=[{idLigne:1, virtual:10, magic:1},
			  {idLigne:2, virtual:50, magic:2},
			  {idLigne:3, virtual:30, magic:3},
			  {idLigne:4, virtual:30, magic:4},
			  {idLigne:5, virtual:30, magic:5},
			  {idLigne:6, virtual:30, magic:6}];*/
//var config={id:'idLigne',fields:{virtualField: 'virtual', magicField:'magic'}};
console.log((new Date()) + ' Starting...');

var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
   console.log((new Date()) + ' Create server...');
});
server.listen(config.get('server.port'), function() { });
console.log((new Date()) + ' Create ws server port:'+config.get('server.port')+'...');
// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

var services = config.get('services');


services.forEach(function(service) {
	try{

		

		
		// WebSocket server
		wsServer.on('request', function(request) {
		  var connection = request.accept(null, request.origin);
		  console.log((new Date()) + ' Connection from origin ' + request.origin + '.' + " Client " + connection.remoteAddress);
		  
		  var config = {};
		  
		  config.updateTime=service.updateTime;
		  config.parallelRequest=service.parallelRequest;
		  
		  //Get data and send it to client
		  var data = getDataFromSource(service);
		  connection.sendUTF(JSON.stringify({ type: 'full',config:config ,fieldConfig: data.FieldConfig ,data: data.currentData} ));
		
		/*function update() {
			connection.sendUTF(JSON.stringify({ type: 'update', data: data.currentData} ));
			setTimeout(update, 4000);
		}
		setTimeout(update, 20000);*/
		  
		  /////////////////////
		  /*function update(id, value,value2) {
			connection.sendUTF(JSON.stringify({ type: 'update', data: [{ id: id, virtualFieldValue: value, magicFieldValue: value2 }]} ));
			setTimeout(update, 500, id, value+10, value2+1);
		  }
			setTimeout(update, 500, 6,0,0);

		  */
		  /////////////////////
		  
		  // This is the most important callback for us, we'll handle
		  // all messages from users here.
		  connection.on('message', function(message) {
			console.log('Message:');
			console.log(message);
			var messageContent = JSON.parse(message.utf8Data);
			console.log('-----');
			if (messageContent.type == 'status' && messageContent.data=='Ready') {
			  // process WebSocket message
			  connection.sendUTF(JSON.stringify({ type: 'status', data: 'OnLine'} ));
			}
			
			if (messageContent.type == 'task' && messageContent.data=='update') {
				// process WebSocket message
				//Get data and send it to client
				var data = getDataFromSource(service);
				connection.sendUTF(JSON.stringify({ type: 'update',config: data.FieldConfig ,data: data.currentData} ));
			}
			
		  });

		  connection.on('close', function(connection) {
			// close user connection
			console.log((new Date()) + " Client " + connection.remoteAddress + " disconnected.");
		  });
		});
		
		
		
	} catch (e) {
		console.log('Error: ', e);
		//console.log('Error JSON: ', fulldata);
	}
});














