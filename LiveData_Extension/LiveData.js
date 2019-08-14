define( [ "qlik"
],
function ( qlik) {
	if(window.liveDataConnection===undefined){
		console.log(window);
		window.liveDataConnection=[];
	}
	
	
	/*function createOrSetVariable(ctx, name, value, type="num") {
		var app = qlik.currApp(ctx);
		console.log('Create or set', name, value, type)
		app.variable.getByName(name).then(variableModel => {
			 if(type=="num"){
			 	app.variable.setNumValue(name, value);
			 }else if(type=="string"){
			 	app.variable.setStringValue(name, value);
			 }
		},function(e){
			//Variable not exist
			app.variable.createSessionVariable({
				qInfo: {
					qType: type
				},
				qName : name,
				qDefinition : value.toString()
			  });

		})*/
		
	/*async function createOrSetVariable(ctx, name, value, type="num") {
		var app = qlik.currApp(ctx);
		var variable = await app.variable;
		console.log('Create or set', name, value, type);
		
		try{
			let variableModel = await variable.getByName(name);
			//Variable exist
			if(type=="num"){
			 	await variable.setNumValue(name, value);
			 }else if(type=="string"){
			 	await variable.setStringValue(name, value);
			 }
			 console.log('Seted', name, value, type);
			
		}catch(e){
			//console.log(e);
			//Variable not exist
			await variable.createSessionVariable({
				qInfo: {
					qType: type
				},
				qName : name,
				qDefinition : value.toString()
			  });
			  console.log('Created', name, value, type);
		}*/
		
		//console.log(variableModel);
		/*await app.variable.getByName(name).then(async function(variableModel) {
			 //Variable exist
			 if(type=="num"){
			 	await app.variable.setNumValue(name, value);
			 }else if(type=="string"){
			 	await app.variable.setStringValue(name, value);
			 }
		},async function(e){
			//Variable not exist
			await app.variable.createSessionVariable({
				qInfo: {
					qType: type
				},
				qName : name,
				qDefinition : value.toString()
			  });

		})*/
	function createOrSetVariable(ctx, name, value, type="num") {
		return new Promise(function(resolve, reject) {
			var app = qlik.currApp(ctx);
			//console.log('Create or set', name, value, type);
			app.variable.getByName(name).then(variableModel => {
				 if(type=="num"){
					app.variable.setNumValue(name, value).then(function(data){ resolve('OK:'+name);},function(data){ reject('ERR:'+name);});
				 }else if(type=="string"){
					app.variable.setStringValue(name, value).then(function(data){ resolve('OK:'+name);},function(data){ reject('ERR:'+name);});
				 }
			},function(e){
				//Variable not exist
				app.variable.createSessionVariable({
					qInfo: {
						qType: type
					},
					qName : name,
					qDefinition : value.toString()
				  }).then(function(data){ resolve('OK:'+name);},function(data){ reject('ERR:'+name);});

			})
		});
	}
	function SetVariable(ctx, name, value, type="num") {
		var app = qlik.currApp(ctx);
		console.log('Set', name, value, type)
		if(type=="num"){
			app.variable.setNumValue(name, value);
		}else if(type=="string"){
			app.variable.setStringValue(name, value);
		}

	}
	
	
	
	
	
	
	
	
	return {
		initialProperties: {
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				settings: {
					uses: "settings",
					items: {
						Details: {
							type: "items",
							label: "Paramètres",
							items: {
								name: {
										type: "string",
										label: "virtualFieldName",
										ref: "params.name",
										defaultValue: "virtualField"
								},
								ip: {
										type: "string",
										label: "Ip",
										ref: "params.ip",
										defaultValue: "127.0.0.1"
								},
								port: {
										type: "string",
										label: "Port",
										ref: "params.port",
										defaultValue: "8000"
								},
								service: {
										type: "string",
										label: "Service Name",
										ref: "params.service",
										defaultValue: "demo"
								}
							}
						}
					}
				}
			}
		},
		support : {
			snapshot: true,
			export: true,
			exportData : false
		},
		paint: function ($element,layout) {
			var ctx=this;
			// if user is running mozilla then use it's built-in WebSocket
			window.WebSocket = window.WebSocket || window.MozWebSocket;
			// if browser doesn't support WebSocket, just show
			// some notification and exit
			if (!window.WebSocket) {
				$element.html( "Sorry, but your browser doesn't support WebSocket." )
				return qlik.Promise.resolve();
			}
			// open connection
			try{
				console.log('ws://'+layout.params.ip+':'+layout.params.port);
				//var connection = connectionnew WebSocket('ws://'+layout.params.ip+':'+layout.params.port);
				console.log(window.liveDataConnection);
				if(window.liveDataConnection[layout.params.service]!==undefined){
					//window.liveDataConnection[layout.params.service].close();
					$element.html( "Still connected" );
				}else{
					window.liveDataConnection[layout.params.service] = new WebSocket('ws://'+layout.params.ip+':'+layout.params.port);
					$element.html( "Connecting..." );
				}
				
			} catch (e) {
				console.log('error on connection!');
				$element.html( 'Sorry, but there\'s some problem with your connection or the server is down.');
				return qlik.Promise.resolve();
			}
			
			console.log(window.liveDataConnection[layout.params.service]);
			window.liveDataConnection[layout.params.service].onopen = function () {
				$element.html( "Connected" );
			};
			window.liveDataConnection[layout.params.service].onclose = function() {
				//$element.html( "Connection closed" );
				$element.html( 'Sorry, but there\'s some problem with your connection or the server is down.');
				console.log('Delete connection');
				window.liveDataConnection[layout.params.service]=undefined;
			};

			window.liveDataConnection[layout.params.service].onerror = function (error) {
				// just in there were some problems with connection...
				$element.html( 'Sorry, but there\'s some problem with your connection or the server is down.');
			};
			
			window.liveDataConnection[layout.params.service].onmessage = function (message) {
				try {
					//console.log(message.data);
					//console.log(window);
					var json = JSON.parse(message.data);
					//console.log(json);
					if (json.type=='full'){
						//$element.html( "Loading data..." );
						
						
						
						//setStringVariableValue(ctx, layout.params.name, 'pick(id,virtualFieldValue1, virtualFieldValue2, virtualFieldValue3, virtualFieldValue4, virtualFieldValue5, virtualFieldValue6)' );
						/*createOrSetVariable(ctx, layout.params.name, 'pick(id,virtualFieldValue1, virtualFieldValue2, virtualFieldValue3, virtualFieldValue4, virtualFieldValue5, virtualFieldValue6)', 'string' );
						json.data.forEach(function(item){
							console.log(layout.params.name+item[0], item[1]);
							createOrSetVariable(ctx, layout.params.name+'Value'+item[0], item[1], 'num');
						});*/
						
						//json.config
						var arrayToSend = Array();
						window.liveDataConnection[layout.params.service].data =  Array();
						Object.keys(json.fieldConfig).map( function(configFieldKey, index) {
							//createOrSetVariable(ctx, configFieldKey, json.config[configFieldKey], 'string' );
							arrayToSend.push({field:configFieldKey, value:json.fieldConfig[configFieldKey], type:'string'});
						});
						
						//json.data
						json.data.forEach(function(item){
							if(item.id !==undefined){
								Object.keys(item).map( function(field, index) {
									if(field!='id' && item[field]!=null && item.id!=null){
										//createOrSetVariable(ctx, field+item.id, item[field], 'num' );
										arrayToSend.push({field:field+item.id, value:item[field], type:'num', status:'create'});
										if(window.liveDataConnection[layout.params.service].data[item.id]===undefined){
											window.liveDataConnection[layout.params.service].data[item.id]={};
										}
										window.liveDataConnection[layout.params.service].data[item.id][field]=item[field];
									}
								});
							}
						});
						
						console.log(arrayToSend);
						console.log(arrayToSend.length);
						/*while (arrayToSend.length)>0{
							var line = arrayToSend.pop();
							createOrSetVariable(ctx, line.field, line.value, line.type );
						}*/
						
						
						var arrayLength=arrayToSend.length;
						var runningRequest=0;
						function createRequest(){
							if(arrayToSend.length>0){
								var line = arrayToSend.pop();
								createOrSetVariable(ctx, line.field, line.value, line.type ).then(function(value) {
									//console.log('OK'+line.field,value);
									var percent=(arrayLength-arrayToSend.length)/arrayLength;
									
									$element.html( '<progress value="'+percent*200+'" max="'+200+'">'+percent*100+'%</progress>');
									
									if(arrayToSend.length>0){
										//console.log('>'+arrayToSend.length);
										createRequest();
									}else{
										runningRequest--;
										if(runningRequest==0){
											$element.html( "Data fresh" );
											console.log('END SEND');
											function update() {
												console.log('>>>>>>ASK for update 1');
												window.liveDataConnection[layout.params.service].send(JSON.stringify({ type: 'task', data: 'update'} ));
											}
											setTimeout(update, 10000);
										}
										
									}
								},function(value) {
									//Error: resend data
									console.log('ERR'+line.field+'->Resend',value);
									arrayToSend.push(line);
									createRequest();
								});
							}
						}
						
						for(var i =0;i<10;i++){
							runningRequest++;
							createRequest();
						}
						
						console.log('end');
					
					}
					
					
					
					if (json.type=='update'){
						//console.log(json.data);
						/*json.data.forEach(function(item){
							console.log(layout.params.name+item[0], item[1]);
							SetVariable(ctx, layout.params.name+'Value'+item[0], item[1],"num");
						});*/
						/*json.data.forEach(function(item){
							if(item.id !==undefined){
								Object.keys(item).map( function(field, index) {
									if(field!='id'){
										SetVariable(ctx, field+item.id, item[field], 'num' );
									}
								});
							}
						});*/
						
						
						var arrayToSend = Array();
						
						json.data.forEach(function(item){
							if(item.id !==undefined){
								Object.keys(item).map( function(field, index) {
									if(field!='id' && item[field]!=null && item.id!=null){
										var status= 'update';
										if(window.liveDataConnection[layout.params.service].data[item.id]===undefined){
											window.liveDataConnection[layout.params.service].data[item.id]={};
											status= 'create';
										}
										if(window.liveDataConnection[layout.params.service].data[item.id][field]===undefined){
											status= 'create';
										}
										
										if(status=='create' || window.liveDataConnection[layout.params.service].data[item.id][field]!=item[field]){
											arrayToSend.push({field:field+item.id, value:item[field], type:'num',status:status});
										}
										window.liveDataConnection[layout.params.service].data[item.id][field]=item[field];
										
									}
								});
							}
						});
						
						console.log(arrayToSend);
						console.log(arrayToSend.length);
						
						var arrayLength=arrayToSend.length;
						var runningRequest=0;
						function createRequest(){
							if(arrayToSend.length>0){
								var line = arrayToSend.pop();
								createOrSetVariable(ctx, line.field, line.value, line.type ).then(function(value) {
									//console.log('OK'+line.field,value);
									var percent=(arrayLength-arrayToSend.length)/arrayLength;
									
									$element.html( '<progress value="'+percent*200+'" max="'+200+'">'+percent*100+'%</progress>');
									
									if(arrayToSend.length>0){
										//console.log('>'+arrayToSend.length);
										createRequest();
									}else{
										runningRequest--;
										if(runningRequest==0){
											$element.html( "Data fresh UPDATE" );
											console.log('END SEND- UPDATE');
											function update() {
												console.log('>>>>>>ASK for update 2');
												window.liveDataConnection[layout.params.service].send(JSON.stringify({ type: 'task', data: 'update'} ));
											}
											setTimeout(update, 10000);
										}
									}
								},function(value) {
									//Error: resend data
									console.log('ERR'+line.field+'->Resend',value);
									arrayToSend.push(line);
									createRequest();
								});
							}
						}
						if(arrayToSend.length>0){
							for(var i =0;i<10;i++){
								runningRequest++;
								createRequest();
							}
						}else{
							function update() {
								console.log('>>>>>>ASK for update 3');
								window.liveDataConnection[layout.params.service].send(JSON.stringify({ type: 'task', data: 'update'} ));
							}
							setTimeout(update, 10000);
						}
						
						
					}
					
					if (json.type=='status' && json.data=='OnLine'){
						$element.html( "On Line" );
					}
					
				} catch (e) {
					console.log('Error: ', e);
					console.log('Error JSON: ', message.data);
				}
			}
			
			//Send a Ready message
			if(window.liveDataConnection[layout.params.service]!=undefined && window.liveDataConnection[layout.params.service].readyState==1){
				try{
					window.liveDataConnection[layout.params.service].send(JSON.stringify({ type: 'status', data: 'Ready'} ));
				} catch (e) {
						console.log('Error: ', e);
				}
			}
			
			
			
			//add your rendering code here
			//$element.html( "LiveData" );
			//needed for export
			return qlik.Promise.resolve();
		}
	};

} );

