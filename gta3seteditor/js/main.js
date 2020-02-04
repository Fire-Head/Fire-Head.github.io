function fixNumericFieldValue(field)
{
	var val=field.value.replace(/[^0-9\-\.]/g,'');
	if(/^float-/.test(field.id))
		val=parseFloat(val);
	else
		val=parseInt(val);
	

	if(isNaN(val) || val<field.minValue)
		val=field.minValue;
	else if(val > field.maxValue)
		val=field.maxValue;

	field.value=val;
}

function getField(field)
{
	return document.getElementById(field);
}

function setValue(f,val)
{
	var field=getField(f);
	if(/^span-/.test(field.id))
		field.innerHTML=val;
	else
		field.value=val;
}

function getFloatValue(f)
{
	var field=getField(f);
	return parseFloat(field.value);
}

function getIntValue(f)
{
	var field=getField(f);
	fixNumericFieldValue(field);
	return parseInt(field.value);
}

function getStringValue(f)
{
	var field=getField(f);
	return String(field.value);
}

function getChecked(f)
{
	var field=getField(f);
	return field.checked;
}

function setChecked(f, b)
{
	var field=getField(f);
	field.checked = b;
}


const VER_UNKNOWN = 0;
const VER_PC = 1;
const VER_MOBILE1_0 = 2;
const VER_MOBILE1_3 = 3;
const VER_MOBILE1_4 = 4;
const VER_MOBILE1_6 = 5;

var nVersion = VER_UNKNOWN;

function IsPC()
{
	return nVersion == VER_PC;
}

function IsMobile()
{
	return nVersion > VER_PC;
}

function IsMobile1_3() // 1.3 or later
{
	return nVersion >= VER_MOBILE1_3;
}

function IsMobile1_4() // 1.4 or later
{
	return nVersion >= VER_MOBILE1_4;
}

function IsMobile1_6() // 1.6 or later
{
	return nVersion >= VER_MOBILE1_6;
}

function GetVersionBySize(size)
{
	/*
		1.0 - 2177 ?
		1.1 - 2177
		1.2 - 2177
		1.3 - 2183
		1.4 - 2183
		1.6 - 2187
	*/
	switch(size)
	{
		case 1653:
			return VER_PC;
			break;
		case 2177:
			return VER_MOBILE1_0;
			break;
		case 2183:
			return VER_MOBILE1_3;
			break;
		case 2187:
			return VER_MOBILE1_6;
			break;
		default:
			return VER_UNKNOWN;
	}
	return VER_UNKNOWN;
}

function GetVersionString(ver)
{
	switch(ver)
	{
		case VER_PC:
			return "PC";
			break;
		case VER_MOBILE1_0:
			return "Mobile v1.0/1.1/1.2";
			break;
		case VER_MOBILE1_3:
			return "Mobile v1.3/1.4";
			break;
		case VER_MOBILE1_6:
			return "Mobile v1.6";
			break;
		default:
			return "Unknown";
	}
	return "Unknown";
}


var tSetVer0 =
{
	'jBinary.all': 'file',
	'jBinary.littleEndian': true,
	
	tControllerBind:
	{
		key: 'int32',
		setOrder: 'int32'
	},
	
	tControllerBindPack:
	{
		aBinds: ['array', 'tControllerBind', 4]
	},
	
	tTouchScreenButtonParams:
	{
		fX: 'float32',
		fY: 'float32',
		fWidth: 'float32',
		fHeight: 'float32',
	},
	
	file:
	{
		//mobile version header	
		VersionString: ['if', IsMobile1_3, ['string', 4]],
		nVersionNumber: ['if', IsMobile1_3, 'int8'],
		
		// PC Settings
		aSettings : ['array', 'tControllerBindPack', 41],
		RubbishString1: ['string', 20],
		RubbishString2: ['string', 20],
		RubbishString3: ['string', 4],
		RubbishString4: ['string', 4],
		RubbishString5: ['string', 1],
		RubbishString6: ['string', 1],
		RubbishString7: ['string', 1],
		bHeadBob: 'uint8',
		fMouseAccelHorzntl: 'float32',
		fMouseAccelVertical: 'float32',
		bInvertVertically: 'uint8',
		bDisableMouseSteering: 'uint8',
		nSfxVolume: 'uint8',
		nMusicVolume: 'uint8',
		nRadioStation: 'int8',
		nSpeakers: 'int8',
		nAudio3DProviderIndex: 'int8',
		bDMA: 'uint8',
		nBrightness: ['if', IsPC, 'uint8', 'int32'], //nBrightness: 'int32'; //On PC - int8, Android - int32
		fLOD: 'float32',
		bShowSubtitles: 'uint8',
		bUseWideScreen: 'uint8',
		bVsyncDisp: 'uint8',
		bFrameLimiter: 'uint8',
		nVideoMode: 'int8',
		bBlurOn: 'uint8',
		PrefsSkinFile: ['string', 256],
		nControlMethod: 'int8',
		nPrefsLanguage: 'int8',
		// Mobile Data
		
		fMobileResolution: ['if', IsMobile, 'float32'],
		bDynamicShadows: ['if', IsMobile, 'uint8'],
		bUseAccelerometer: ['if', IsMobile, 'uint8'],
		bDriveWithAnalog: ['if', IsMobile, 'uint8'],
		bLeftHanded: ['if', IsMobile, 'uint8'],
		nMobileEffects: ['if', IsMobile, 'int32'],
		bHaptics: ['if', IsMobile1_3, 'uint8'],
		nGameStartedCounter: ['if', IsMobile1_6, 'int32'],
		
		TouchscreenSignature: ['if', IsMobile, 'uint8'],
		aTouchscreenButtonsSettings: ['if', IsMobile, ['array', 'tTouchScreenButtonParams', 32]],
	}
};


var SetFile = null;
var SetFileReader = null;


function create_parser(data)
{
	SetFileReader = new jBinary(data, tSetVer0);
	return SetFileReader.readAll();
}


function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function ReplaceWinELOWithUnix(instr)
{
	var str = escape(instr);	
	str = replaceAll(str, '%0D?%0A', '%0A');
	str = unescape(str);
	return str;
}

function ReplaceUnixELOWithWin(instr)
{
	var str = escape(instr);	
	str = replaceAll(str, '%0A', '%0D%0A');
	str = unescape(str);
	return str;
}

function ab2str(buf)
{
	return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str)
{
	var buf = new ArrayBuffer(str.length);
	var bufView = new Uint8Array(buf);
	for (var i=0, strLen=str.length; i < strLen; i++)
	{
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

function HandleFiles(filelist)
{
	var f = filelist[0];
	
	if ( !f ) return;

	nVersion = GetVersionBySize(f.size);
	
	if ( nVersion != VER_UNKNOWN )
	{
		getField("ID-Version").innerHTML = GetVersionString(nVersion);
		var reader=new FileReader();
		
		reader.onload=function(e)
		{
			var raw=e.target.result;
			
			var string = ab2str(raw);
			
			if ( IsPC() )
				string = ReplaceWinELOWithUnix(string);	
			
			SetFile = create_parser(string);
			
			SetGui();
		}
		
		reader.readAsArrayBuffer(f);
	}
	
	SetupElements();
}

function HandleDownload()
{
	if ( SetFile && SetFileReader )
	{
		GetGui();
		
		SetFileReader.seek(0);
		SetFileReader.writeAll(SetFile, 0);
		
		var string = ab2str(SetFileReader.view.buffer);
		
		if ( IsPC() )
			string = ReplaceUnixELOWithWin(string);
		
		var buff = str2ab(string);
		var blob = new Blob([buff]);
		
		saveAs(blob, 'gta3.set');
	}
}

function SetupElements()
{	
	if ( IsPC() || IsMobile() )
		showElement("ID-PCSpecific", true);
	else
		showElement("ID-PCSpecific", false);
	
	if ( IsMobile() )
		showElement("ID-MobileSpecific", true);
	else
		showElement("ID-MobileSpecific", false);
	
	if ( IsMobile1_3() )
	{
		showElement("ID-Mobile1_3_VersionStuffs", true);
		showElement("ID-Haptics1_3", true);
	}
	else
	{
		showElement("ID-Mobile1_3_VersionStuffs", false);
		showElement("ID-Haptics1_3", false);
	}
	
	if ( IsMobile1_6() )
		showElement("ID-GameStartedCounter1_6", true);
	else
		showElement("ID-GameStartedCounter1_6", false);
}

function SetGui()
{
	if ( IsMobile1_3() )
	{
		setValue("ID-VersionString", SetFile.VersionString);
		setValue("ID-nVersionNumber", SetFile.nVersionNumber);
	}
	
	
	var aControllers = ["KB", "EX", "MS", "PD"];
	
	for( var i = 0; i < 41; i++ )
	{
		for ( var n = 0; n < 4; n++ )
		{
			setValue("ID-["+i+"]_"+aControllers[n]+"_KEY", SetFile.aSettings[i].aBinds[n].key);
			setValue("ID-["+i+"]_"+aControllers[n]+"_ORD", SetFile.aSettings[i].aBinds[n].setOrder);
		}
	}
	
	setValue("ID-RubbishString1", SetFile.RubbishString1);
	setValue("ID-RubbishString2", SetFile.RubbishString2);
	setValue("ID-RubbishString3", SetFile.RubbishString3);
	setValue("ID-RubbishString4", SetFile.RubbishString4);
	setValue("ID-RubbishString5", SetFile.RubbishString5);
	setValue("ID-RubbishString6", SetFile.RubbishString6);
	setValue("ID-RubbishString7", SetFile.RubbishString7);
	setChecked("ID-bHeadBob", SetFile.bHeadBob);
	setValue("ID-fMouseAccelHorzntl", SetFile.fMouseAccelHorzntl);
	setValue("ID-fMouseAccelVertical", SetFile.fMouseAccelVertical);
	setChecked("ID-bInvertVertically", SetFile.bInvertVertically);
	setChecked("ID-bDisableMouseSteering", SetFile.bDisableMouseSteering);
	setValue("ID-nSfxVolume", SetFile.nSfxVolume);
	setValue("ID-nMusicVolume", SetFile.nMusicVolume);
	setValue("ID-nRadioStation", SetFile.nRadioStation);
	setValue("ID-nSpeakers", SetFile.nSpeakers);
	setValue("ID-nAudio3DProviderIndex", SetFile.nAudio3DProviderIndex);
	setChecked("ID-bDMA", SetFile.bDMA);
	setValue("ID-nBrightness", SetFile.nBrightness);
	setValue("ID-fLOD", SetFile.fLOD);
	setChecked("ID-bShowSubtitles", SetFile.bShowSubtitles);
	setChecked("ID-bUseWideScreen", SetFile.bUseWideScreen);
	setChecked("ID-bVsyncDisp", SetFile.bVsyncDisp);
	setChecked("ID-bFrameLimiter", SetFile.bFrameLimiter);
	setValue("ID-nVideoMode", SetFile.nVideoMode);
	setChecked("ID-bBlurOn", SetFile.bBlurOn);
	setValue("ID-PrefsSkinFile", SetFile.PrefsSkinFile);
	setValue("ID-nControlMethod", SetFile.nControlMethod);
	setValue("ID-nPrefsLanguage", SetFile.nPrefsLanguage);
	
	
	if ( IsMobile() )
	{
		setValue("ID-fMobileResolution", SetFile.fMobileResolution);
		setChecked("ID-bDynamicShadows", SetFile.bDynamicShadows);
		setChecked("ID-bUseAccelerometer", SetFile.bUseAccelerometer);
		setChecked("ID-bDriveWithAnalog", SetFile.bDriveWithAnalog);
		setChecked("ID-bLeftHanded", SetFile.bLeftHanded);
		setValue("ID-nMobileEffects", SetFile.nMobileEffects);
	}
	
	if ( IsMobile1_3() )
		setChecked("ID-bHaptics", SetFile.bHaptics);

	if ( IsMobile1_6() )
		setValue("ID-nGameStartedCounter", SetFile.nGameStartedCounter);
	
	if ( IsMobile() )
	{
		setValue("ID-TouchscreenSignature", SetFile.TouchscreenSignature);
		
		
		for( var i = 0; i < 32; i++ )
		{
			setValue("ID-["+i+"]_TP_X", SetFile.aTouchscreenButtonsSettings[i].fX);
			setValue("ID-["+i+"]_TP_Y", SetFile.aTouchscreenButtonsSettings[i].fY);
			setValue("ID-["+i+"]_TP_W", SetFile.aTouchscreenButtonsSettings[i].fWidth);
			setValue("ID-["+i+"]_TP_H", SetFile.aTouchscreenButtonsSettings[i].fHeight);
		}
	}
}

function GetGui()
{
	if ( IsMobile1_3() )
	{
		SetFile.VersionString = getStringValue("ID-VersionString");
		SetFile.nVersionNumber = getIntValue("ID-nVersionNumber");
	}
	
	
	var aControllers = ["KB", "EX", "MS", "PD"];
	
	for( var i = 0; i < 41; i++ )
	{
		for ( var n = 0; n < 4; n++ )
		{
			SetFile.aSettings[i].aBinds[n].key = getIntValue("ID-["+i+"]_"+aControllers[n]+"_KEY");
			SetFile.aSettings[i].aBinds[n].setOrder = getIntValue("ID-["+i+"]_"+aControllers[n]+"_ORD");
		}
	}
	
	SetFile.RubbishString1 = getStringValue("ID-RubbishString1");
	SetFile.RubbishString2 = getStringValue("ID-RubbishString2");
	SetFile.RubbishString3 = getStringValue("ID-RubbishString3");
	SetFile.RubbishString4 = getStringValue("ID-RubbishString4");
	SetFile.RubbishString5 = getStringValue("ID-RubbishString5");
	SetFile.RubbishString6 = getStringValue("ID-RubbishString6");
	SetFile.RubbishString7 = getStringValue("ID-RubbishString7");
	SetFile.bHeadBob = getChecked("ID-bHeadBob");
	SetFile.fMouseAccelHorzntl = getFloatValue("ID-fMouseAccelHorzntl");
	SetFile.fMouseAccelVertical = getFloatValue("ID-fMouseAccelVertical");
	SetFile.bInvertVertically = getChecked("ID-bInvertVertically");
	SetFile.bDisableMouseSteering = getChecked("ID-bDisableMouseSteering");
	SetFile.nSfxVolume = getIntValue("ID-nSfxVolume");
	SetFile.nMusicVolume = getIntValue("ID-nMusicVolume");
	SetFile.nRadioStation = getIntValue("ID-nRadioStation");
	SetFile.nSpeakers = getIntValue("ID-nSpeakers");
	SetFile.nAudio3DProviderIndex = getIntValue("ID-nAudio3DProviderIndex");
	SetFile.bDMA = getChecked("ID-bDMA");
	SetFile.nBrightness = getIntValue("ID-nBrightness");
	SetFile.fLOD = getFloatValue("ID-fLOD");
	SetFile.bShowSubtitles = getChecked("ID-bShowSubtitles");
	SetFile.bUseWideScreen = getChecked("ID-bUseWideScreen");
	SetFile.bVsyncDisp = getChecked("ID-bVsyncDisp");
	SetFile.bFrameLimiter = getChecked("ID-bFrameLimiter");
	SetFile.nVideoMode = getIntValue("ID-nVideoMode");
	SetFile.bBlurOn = getChecked("ID-bBlurOn");
	SetFile.PrefsSkinFile = getStringValue("ID-PrefsSkinFile");
	SetFile.nControlMethod = getIntValue("ID-nControlMethod");
	SetFile.nPrefsLanguage = getIntValue("ID-nPrefsLanguage");
	
	if ( IsMobile() )
	{
		SetFile.fMobileResolution = getFloatValue("ID-fMobileResolution");
		SetFile.bDynamicShadows = getChecked("ID-bDynamicShadows");
		SetFile.bUseAccelerometer = getChecked("ID-bUseAccelerometer");
		SetFile.bDriveWithAnalog = getChecked("ID-bDriveWithAnalog");
		SetFile.bLeftHanded = getChecked("ID-bLeftHanded");
		SetFile.nMobileEffects = getIntValue("ID-nMobileEffects");
	}
	
	if ( IsMobile1_3() )
		SetFile.bHaptics = getChecked("ID-bHaptics");

	if ( IsMobile1_6() )
		SetFile.nGameStartedCounter = getIntValue("ID-nGameStartedCounter");
	
	if ( IsMobile() )
	{
		SetFile.TouchscreenSignature = getIntValue("ID-TouchscreenSignature");
		
		
		for( var i = 0; i < 32; i++ )
		{
			SetFile.aTouchscreenButtonsSettings[i].fX = getFloatValue("ID-["+i+"]_TP_X");
			SetFile.aTouchscreenButtonsSettings[i].fY = getFloatValue("ID-["+i+"]_TP_Y");
			SetFile.aTouchscreenButtonsSettings[i].fWidth = getFloatValue("ID-["+i+"]_TP_W");
			SetFile.aTouchscreenButtonsSettings[i].fHeight = getFloatValue("ID-["+i+"]_TP_H");
		}
	}
}


function showElement(id, b)
{	
	if ( b == true )
		document.getElementById(id).style.display = "block";
	else
		document.getElementById(id).style.display = "none";
}


function showhide(id)
{
	var e = document.getElementById(id);
	e.style.display = (e.style.display == 'block') ? 'none' : 'block';
}