function SalatOptions() {};
SalatOptions.prototype = {
  startup: function() {
    
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.salattimes.");
    
    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
    
    var location = this.prefs.getCharPref("location").toUpperCase();
    
    if (location !== ""){
    	var locItems = location.split("|");
    	if (locItems.length >= 3) {
    		var salatLabel = document.getElementById('opt-txt-location');
    		salatLabel.value = locItems[0] + "," + locItems[1] + "," + locItems[2];
    	}
    }
  },
  shutdown: function()
  {
    this.prefs.removeObserver("", this);
  },
  setLocation: function()
  {
	  var listLocation = document.getElementById('geoList');
	  
	  if (listLocation.itemCount == 0)
		  return;
	  
	  if (listLocation.selectedCount == 0)
		  listLocation.selectItem(listLocation.getItemAtIndex(0));
	  
	  var httpRequest = null;
	  var latlng = listLocation.selectedItem.value.split("|");
	  
      var fullUrl = "http://ws.geonames.org/timezone?lat=" + latlng[1] + "&lng=" + latlng[0];
      
      function infoReceived()
      {
    	  var output = httpRequest.responseText;
    	  var xml = gOptions.parseXml(output);
    	  var status = xml.getElementsByTagName("gmtOffset")[0];
    	  status = listLocation.selectedItem.label + "|" + listLocation.selectedItem.value + "|" + status.textContent;
    	  
    	  gOptions.prefs.setCharPref("location",  status);
      }
    
      httpRequest = new XMLHttpRequest();
      httpRequest.open("GET", fullUrl, true);
      httpRequest.onload = infoReceived;
      httpRequest.send(null);
  },
  parseXml: function(xml) 
  {
    var xmlDoc = null;
    if (window.DOMParser)
    {
    parser=new DOMParser();
    xmlDoc=parser.parseFromString(xml,"text/xml");
    }
  else // Internet Explorer
    {
    xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async="false";
    xmlDoc.loadXML(xml); 
    }
    return xmlDoc;
  },
  // Refresh the stock information
  findLocation: function()
  {
      var httpRequest = null;
      
      var salatLabel = document.getElementById('opt-txt-location');

      var listLocation = document.getElementById('geoList');
	  while(listLocation.itemCount > 0)
	  {
		  listLocation.removeItemAt(0);
	  }

      var label = encodeURI(salatLabel.value);
      var fullUrl = "http://maps.google.com/maps/geo?q=" + label + "&output=xml&oe=utf8&sensor=false&key=ABQIAAAAeEu53kLZK03TzLpprIb0mBSm-FJPGg2xMRY09KX-giEGc053UBS1lTKGFzOsdSWxaJBO59Ae6sqGUg"; //"http://salattimes.keensocial.com/index.php?action=geocode&address=" + label;
      alert(fullUrl);
      function infoReceived()
      {
    	  var locations = new Array();
    	  var output = httpRequest.responseText;
    	  var xml = gOptions.parseXml(output);
    	  var status = xml.getElementsByTagName("Status")[0];
    	  status = status.firstElementChild.textContent; 
    	  if (status == 200) {
    		  var placemarks = xml.getElementsByTagName("Placemark");
    		  
    		  for(var i = 0; i < placemarks.length; ++i)
    		  {
    			  var country = placemarks[i].children[1].children[0];
    			  var countryCode = country.children[0].textContent;
    			  var admin = country.children[2];
    			  var adminName = admin.children[0].textContent;
    			  var subAdmin = admin.children[1];
    			  //var subAdminName = subAdmin.children[0].textContent;
    			  var locality = subAdmin.children[1];
    			  var localityName = locality.children[0].textContent;
    			  
    			  //var address = localityName + ", " + subAdminName + ", " + adminName + ", " + countryCode;
    			  var address = localityName + "|" + adminName + "|" + countryCode;
    			  var point = placemarks[i].children[3].children[0].textContent;
    			  
    			  point = point.split(",", 2);
    			  point = point[0] + "|" + point[1];
    			  
    			  listLocation.appendItem(address, point);
    		  }
    		  listLocation.selectItem(listLocation.getItemAtIndex(0));
    		  if (listLocation.selectedCount > 0)
    		  {
    			  var btnSave = document.getElementById('opt-cmd-save');
    			  btnSave.disabled = false;
    		  }
    	  }
      }
      
      httpRequest = new XMLHttpRequest();
      
      httpRequest.open("GET", fullUrl, true);
      httpRequest.onload = infoReceived;
      httpRequest.send(null);
  }
}

var gOptions = new SalatOptions();
window.addEventListener("load", gOptions.startup, false);
window.addEventListener("unload", gOptions.shutdown, false);