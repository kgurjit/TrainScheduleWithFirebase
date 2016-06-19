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

		  	firebase.database().ref('schedules/').on('child_removed', function(snapshot) {
			  $("tr[data-key='" + snapshot.key + "']").remove();
	 	  	});	

	 	  	firebase.database().ref('schedules/').on('child_changed', function(snapshot) {
			  updateTable(snapshot.key, snapshot.val());
	 	  	});	

		  };
		  
		  addUpdateListener();
		  
		  var saveSch = function(){
		  	var trainName = $("#trainName").val();
		  	var destination = $("#destination").val();
		  	var firstTrainTime = $("#firstTrainTime").val();
		  	var frequency = $("#frequency").val();

		  	if($.trim(trainName) === '' || $.trim(destination) === '' || $.trim(firstTrainTime) === '' || $.trim(frequency) === '') {
		  		$("#errorModal").modal();
		  		return;
		  	}
		  	var schKey = $("#key").val();

		  	if(schKey === '') {
		  		schKey = firebase.database().ref().child('/schedules/').push().key;
		  	} 

		  	var resource = '/schedules/' + schKey;
		  	var newSch = {
			    trainName:trainName,
			    destination:destination,
			    firstTrainTime:firstTrainTime,
			    frequency:frequency
		  	};

		  	var update = {};
		  	update['/schedules/' + schKey] = newSch;
			firebase.database().ref().update(update);
			clearAll();
		  };

		  $("#addTrainNameBtn").on("click",function(e){
		  	e.preventDefault();
		  	saveSch();
		 });

		  $("tbody").on("click", ".deleteSch", function(e){
		  	e.preventDefault();
		  	if(confirm('Are you sure?')){
		  		var key = $(this).data("id");
		  		firebase.database().ref('/schedules').child(key).remove();
		  	}
		  });

		  $("tbody").on("click", ".editSch", function(e){
		  	e.preventDefault();
		  	$("#editTitle").html("Edit Train");
		  	var key = $(this).data("id");
		  	var tr = $("tr[data-key='" + key + "']");
		  	var cols = tr.find('td');
		  	$("#trainName").val(cols.eq(0).html());
		  	$("#destination").val(cols.eq(1).html());
		  	$("#firstTrainTime").val(tr.data('firsttime'));
		  	$("#frequency").val(tr.data('freq'));
		  	$("#key").val(key);
		  });

		  $("#cancelBtn").on("click", function(){
		  	clearAll();
		  });

		  var clearAll = function(){
		  	$("#trainName").val('');
		  	$("#destination").val('');
		  	$("#firstTrainTime").val('');
		  	$("#frequency").val('');
		  	$("#key").val('');
		  	$("#editTitle").html("Add Train");
		  };

		var updateTable = function(key, data){
			var freq = data["frequency"];
			var firstTrainTime = data["firstTrainTime"];

			var firstTimeConverted = moment(firstTrainTime,"hh:mma");
			var currentTime = moment();
			var diffTime = currentTime.diff(moment(firstTimeConverted), "minutes");
			var remainder = diffTime % freq;
			var minutesTillTrain = freq - remainder;
			var nextTrain = currentTime.add(minutesTillTrain, "minutes");

			var tr = $("tr[data-key='" + key + "']");
			if(tr.length > 0){
				tr.attr("data-freq", freq);
				tr.attr("data-firsttime", firstTrainTime);
				var cols = tr.find("td");
				cols.eq(0).html(data["trainName"]);
				cols.eq(1).html(data["destination"]);
				cols.eq(2).html(data["frequency"]);
				cols.eq(3).html(moment(nextTrain).format("hh:mma"));
				cols.eq(4).html(minutesTillTrain);
				return;
			}

			var newRow = $("<tr></tr>").attr("data-freq", freq).attr("data-firsttime", firstTrainTime).attr("data-key", key);
			newRow.append($("<td></td>").html(data["trainName"]));
			newRow.append($("<td></td>").html(data["destination"]));
			newRow.append($("<td></td>").html(data["frequency"]));
			newRow.append($("<td></td>").html(moment(nextTrain).format("hh:mma")));
			newRow.append($("<td></td>").html(minutesTillTrain));
			if(window.location.href.indexOf('manage.html') > -1) {
				var delAnchor = $("<a>Delete</a>").attr("href","#").attr("class", "row-action deleteSch").attr("data-id", key);

				var editAnchor = $("<a>Edit</a>").attr("href","#").attr("class", "editSch").attr("data-id", key);

				newRow.append($("<td></td>").append(delAnchor).append().append(editAnchor));
			}

			newRow.appendTo("#data");
		};

		$("#firstTrainTime").timepicker();
});