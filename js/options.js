jQuery(document).ready(function () {

  var form = $("#mainForm");

  function saveFormValues() {
  
    $("[name]", form).each(function () {
      var i = $(this).attr("name");
      if ( $(this).attr("type") == "checkbox" )
        localStorage[ i ] = ( $(this).is(":checked") ? 1 : 0 );
      else
      {
        if ( $(this).attr("type") == "radio" )
          localStorage[ i ] = $("[name="+i+"]:checked").val();
        else
          localStorage[ i ] = $(this).val();
      }
    });
    setFormValues();
  
  }

  //form.change(saveFormValues);
  //form.find("[name]").bind("click change blur keyup keydown keypress", saveFormValues);
  //form.find("[type=text]").unbind("keyup keydown keypress");
  
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
      {
        if ( $("[name="+i+"]").attr("type") == "radio" )
          $("[name="+i+"][value="+getSetting(i)+"]").attr("checked", "checked");
        else
          $("#"+i).val( getSetting(i) );
      }
      $("label[for="+i+"] span").html( getSetting(i) );
    }
  }
  
  setFormValues();
  
  $("#save_btn").click(function () {
    saveFormValues();
    return false;
  });
  
  $("input[type=range]").change(function () {
    var e = $(this);
    e.parents(".form-group").find("span").html( e.val() );
  });
  
  $("#upl").change(function () {
  
		var file = this.files[0];
		var textType = /text.*/;

		if (file.type.match(textType)) {
			var reader = new FileReader();

			reader.onload = function(e) {
			  var prep = (getSetting('upl_type') == "append" ? $("#keywords").val() + "\n" : "");
				$("#keywords").val( prep + reader.result );
				//saveFormValues();
				//alert("Keywords were saved successfully.");
			}

			reader.readAsText(file);	
		} else {
			alert("File not supported.");
		}

    return false;
  
  });

});

