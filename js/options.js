jQuery(document).ready(function () {

  var form = $("#mainForm");

  function saveFormValues() {
  
    $("[name]", form).each(function () {
      var i = $(this).attr("name");
      if ( $(this).attr("type") == "checkbox" )
        localStorage[ i ] = ( $(this).is(":checked") ? 1 : 0 );
      else
        localStorage[ i ] = $(this).val();
    });
    setFormValues();
  
  }

  form.change(saveFormValues);
  form.find("[name]").bind("change blur keyup keydown keypress", saveFormValues);
  
  function setFormValues()
  {
    for (var i in ext_defaults)
    {
      if ( $("#"+i).attr("type") == "checkbox" )
      {
        if ( parseInt( getSetting(i) ) ) 
          $("#"+i).attr("checked", "checked");
        else 
          $("#"+i).removeAttr("checked");
      } 
      else
        $("#"+i).val( getSetting(i) );
      $("label[for="+i+"] span").html( getSetting(i) );
    }
  }
  
  setFormValues();
  
  $("#upl").change(function () {
  
		var file = this.files[0];
		var textType = /text.*/;

		if (file.type.match(textType)) {
			var reader = new FileReader();

			reader.onload = function(e) {
				$("#keywords").val( reader.result );
				saveFormValues();
				alert("Keywords were saved successfully.");
			}

			reader.readAsText(file);	
		} else {
			alert("File not supported.");
		}

    return false;
  
  });

});

