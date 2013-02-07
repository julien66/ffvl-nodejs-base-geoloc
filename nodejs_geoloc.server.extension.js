/**
 * Geoloc server extension for nodejs
 *
 * Add this extension name to the "extensions" in node.config.js
 */
var directPublishMessageToContentChannel;
var addChannel;
var removeChannel;
var mongoose = require('mongoose');

exports.setup = function (config) {

  directPublishMessageToContentChannel = config.directPublishMessageToContentChannel;
  
  mongoose.connect('mongodb://localhost/tracking', function(err) {
  	if (err) { console.log(err); }
  	console.log("Started MongoDB.");
  });

  var positionSchema = new mongoose.Schema({
  	uid : Number,
  	tracker_id : String,
  	position :  mongoose.Schema.Types.Mixed
  });

  var positionModel = mongoose.model("positions", positionSchema);

  process.on('client-message', function (sessionId, message) {
    // Logging the message to the console.
    //console.log('Got a message from the client.  Take a look: ');
    //console.log(message);
	if (message.type == "tracker-location"){
		//var pos = new positionModel( {uid: message.uid, tracker_id: message.device, position: message.position } );
		message.channel = "tracking_"+message.uid; 
		positionModel.update( 
			{uid: message.uid, tracker_id: message.device},
			{
				$push: {position: message.position}
			},
			{upsert:true},
			function(err){
				if(err){console.log(err);}
			}
		);
		directPublishMessageToContentChannel(message); // Publier sur la chaîne.
	}

  });
}
