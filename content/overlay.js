function SalatTimes() {};
SalatTimes.prototype = {
  prefs: null,
  location: "",
  startup: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("salattimes-strings");

    
    this.promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);

    // Register to receive notifications of preference changes
    
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.salattimes.");
    
    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
    this.prefs.addObserver("", this, false);
    
    this.location = this.prefs.getCharPref("location").toUpperCase();

    this.refreshInformation();
  },
  shutdown: function()
  {
    this.prefs.removeObserver("", this);
  },
  onMenuItemCommand: function(e) {
    promptService.alert(window, this.strings.getString("helloMessageTitle"),
		      this.strings.getString("helloMessage"));
  },
  observe: function(subject, topic, data)
  {
      if (topic != "nsPref:changed")
      {
		return;
      }
      switch(data)
      {
	  case "location":
		  this.location = this.prefs.getCharPref("location").toUpperCase();
	      this.refreshInformation();
	      break;
      }
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
  updateSalatTimes: function()
  {
  },
  // Refresh the stock information
  refreshInformation: function()
  {
      if (this.location === "")
    	  return;

      var httpRequest = null;
      
      var locItems = this.location.split("|");
      var address = "country=" + locItems[2] + "&city=" + locItems[0] + "&longitude=" + locItems[3] + "&latitude=" + locItems[4] + "&timezone=" + locItems[5];
      
      //country=germany&city=waldbronn&state=01&zipcode=&latitude=48.9167&longitude=8.4833
      var fullUrl = "http://www.islamicfinder.org/prayer_service.php?" + address + "&dayLight=1&HanfiShafi=1&pmethod=1&fajrTwilight1=10&fajrTwilight2=10&ishaTwilight=10&ishaInterval=30&dhuhrInterval=1&maghribInterval=1&simpleFormat=xml&monthly=0&month=";
      
      address = locItems[0] + "," + locItems[1] + "," + locItems[2];
      
      function infoReceived()
      {
    	  var output = httpRequest.responseText;
	  
		  if (output.length)
		  {
			  
		      var xml = gSalatTimes.parseXml(output);
		      var days = xml.getElementsByTagName("date");
		      
		      var opt = document.getElementById('opt-salat-menu');
		      opt.tooltipText = address;
		      
		      if (days.length == 1)
		      {
				var salat = xml.getElementsByTagName("fajr")[0];
				var salatLabel = document.getElementById('salat-fajr');
				salatLabel.value = "Fajr " + salat.childNodes[0].nodeValue;
				salatLabel.tooltipText = "Fajr Prayer:" + "\n" +  salat.childNodes[0].nodeValue;
				
				salat = xml.getElementsByTagName("sunrise")[0];
				salatLabel = document.getElementById('salat-sunrise');
				salatLabel.value = "Sunrise " + salat.childNodes[0].nodeValue;;
				
				salat = xml.getElementsByTagName("dhuhr")[0];
				salatLabel = document.getElementById('salat-dhuhr');
				salatLabel.value = "Dhuhr " + salat.childNodes[0].nodeValue;;
				
				salat = xml.getElementsByTagName("asr")[0];
				salatLabel = document.getElementById('salat-asr');
				salatLabel.value = "Asr " + salat.childNodes[0].nodeValue;;
				
				salat = xml.getElementsByTagName("maghrib")[0];
				salatLabel = document.getElementById('salat-maghrib');
				salatLabel.value = "Maghrib " + salat.childNodes[0].nodeValue;;
				
				salat = xml.getElementsByTagName("isha")[0];
				salatLabel = document.getElementById('salat-isha');
				salatLabel.value = "Isha " + salat.childNodes[0].nodeValue;;
		      }
		      else
		      {
				var currentTime = new Date();
				var day = currentTime.getDate();
				
		      }
		  }
      }
      
      httpRequest = new XMLHttpRequest();
      
      httpRequest.open("GET", fullUrl, true);
      httpRequest.onload = infoReceived;
      httpRequest.send(null);
  }
};

function stLoad()
{
  gSalatTimes = new SalatTimes();
  gSalatTimes.startup();
};

function stUnload()
{
  if (gSalatTimes)
  {
    gSalatTimes.shutdown();
    gSalatTimes = null;
  }
};

window.addEventListener("load", stLoad, false);
window.addEventListener("unload", stUnload, false);