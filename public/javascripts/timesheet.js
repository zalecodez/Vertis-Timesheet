$(document).ready(function(){


  diff = calculateDiffMs();
  periodlength = lengthString(diff);
  $("#periodlength").text("Period Length: "+periodlength);

  if(isNaN(diff) || diff < 0){
    $("#submitPeriod").addClass("disabled");
    $("#submitPeriod").prop('disabled',true);
    if(!isNaN(diff) && diff < 0){
      $("#submitPeriod").prop('data-toggle','tooltip').prop('title',"Start Time can't be before End Time.");
      $("#submitPeriod").tooltip();
    }
  }
  else{
    $("#submitPeriod").removeClass("disabled");
    $("#submitPeriod").prop('disabled',false);
    $("#submitPeriod").removeProp('data-toggle').removeProp('title');
    $("#submitPeriod").tooltip('dispose');
  }

  $(".period").change(function(){
    diff = calculateDiffMs();
    periodlength = lengthString(diff);
    $("#periodlength").text("Period Length: "+periodlength);


    if(isNaN(diff) || diff < 0){
      $("#submitPeriod").addClass("disabled");
      $("#submitPeriod").prop('disabled',true);
      if(!isNaN(diff) && diff < 0){
	$("#submitPeriod").prop('data-toggle','tooltip').prop('title',"Start Time can't be before End Time.");
	$("#submitPeriod").tooltip();
      }
    }
    else{
      $("#submitPeriod").removeClass("disabled");
      $("#submitPeriod").prop('disabled',false);
      $("#submitPeriod").removeProp('data-toggle').removeProp('title');
      $("#submitPeriod").tooltip('dispose');
    }


  });

  $(".timesheetCarousel").carousel({interval:false});

  $(".timesheetCarousel .nav a").css('cursor','pointer');
  $(".timesheetCarousel .nav a").click(function(){
    console.log("CLICKADF");
    $(this).addClass('active');
    $(this).parent().siblings('li').children('.active').removeClass('active');
  });

  $('[data-toggle="tooltip"]').tooltip();

});


function calculateDiffMs(){
  date = $("#date").val();
  endtime = $("#endtime").val();
  starttime = $("#starttime").val();

  start = new Date(date+' '+starttime);
  end = new Date(date+' '+endtime);

  diffMs = end-start;

  return diffMs
}

function lengthString(diffMs){
  if(isNaN(diffMs)){
    return "--";
  }

  diffHours = Math.floor(diffMs / 3600000);
  diffMins = Math.round((diffMs% 3600000) / 60000);

  return diffHours+" Hours and "+diffMins+" Mins";
} 

