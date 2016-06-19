$(document).ready(function(){
			// Initialize Firebase
		  var config = {
		    apiKey: "AIzaSyDGib_BTPxRtncxZ_aH4Z5_hDJS63xnrr0",
		    authDomain: "trainschedules-d2184.firebaseapp.com",
		    databaseURL: "https://trainschedules-d2184.firebaseio.com",
		    storageBucket: "",
		  };
		  firebase.initializeApp(config);

	 	  var addUpdateListener = function(){
		  	firebase.database().ref('schedules/').on('child_added', function(snapshot) {
			  updateTable(snapshot.key, snapshot.val());
	 	  	});	
		  };
		  
		  addUpdateListener();
		  
		  var addTrainSch = function(){
		  	var trainName = $("#trainName").val();
		  	var destination = $("#destination").val();
		  	var firstTrainTime = $("#firstTrainTime").val();
		  	var frequency = $("#frequency").val();

		  	if($.trim(trainName) === '' || $.trim(destination) === '' || $.trim(firstTrainTime) === '' || $.trim(frequency) === '') {
		  		$("#errorModal").modal();
		  		return;
		  	}

		  	var newSchKey = firebase.database().ref().child('/schedules/').push().key;
		  	var resource = '/schedules/' + newSchKey;
		  	var newSch = {
			    trainName:trainName,
			    destination:destination,
			    firstTrainTime:firstTrainTime,
			    frequency:frequency
		  	};

		  	var update = {};
		  	update['/schedules/' + newSchKey] = newSch;
			firebase.database().ref().update(update);
		  };

		  $("#addTrainNameBtn").on("click",function(e){
		  	e.preventDefault();
		  	addTrainSch();
		 });

		var updateTable = function(key, data){
			var freq = data["frequency"];
			var firstTrainTime = data["firstTrainTime"];

			var firstTimeConverted = moment(firstTrainTime,"hh:mma");
			var currentTime = moment();
			var diffTime = currentTime.diff(moment(firstTimeConverted), "minutes");
			var remainder = diffTime % freq;
			var minutesTillTrain = freq - remainder;
			var nextTrain = currentTime.add(minutesTillTrain, "minutes");

			var newRow = $("<tr></tr>").attr("data-freq", freq).attr("data-firsttime", firstTrainTime).attr("data-key", key);
			newRow.append($("<td></td>").html(data["trainName"]));
			newRow.append($("<td></td>").html(data["destination"]));
			newRow.append($("<td></td>").html(data["frequency"]));
			newRow.append($("<td></td>").html(moment(nextTrain).format("hh:mma")));
			newRow.append($("<td></td>").html(minutesTillTrain));

			newRow.appendTo("#data");
		};

		$("#firstTrainTime").timepicker();
});