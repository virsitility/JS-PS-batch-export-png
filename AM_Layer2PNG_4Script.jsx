if (app.documents.length > 0)
	var doc = app.activeDocument; //�Y�w���ɮ׶}�ҡA���N���ɮ׳]�����椤�ɮ�
else {
	alert('No doc opened.');
	//return;
}

var t = new Date().getTime();
var finalArray = [];
var textStyleArray = [];
var txtMark = 0;

var savePath = new Folder(decodeURI(app.activeDocument.path)+'/pic')

var pngName = "";	
var midPath = "";
var opts, file;
opts = new ExportOptionsSaveForWeb();
opts.format = SaveDocumentType.PNG;
opts.PNG8 = false;
opts.quality = 100;

var confirmV = 1//confirm ("�Y�N�t�s�s��!", false, "Warning!");		 

if(confirmV){
	//doc.suspendHistory('Export Layers to PNG', 'LAYR2PNG()');
	LAYR2PNG()
}

function LAYR2PNG(){
	var t = new Date().getTime();
	//���o�Ҧ���Ƨ�
	var rootSets = getLayerSets();
	for(i in rootSets){
		var refRn = new ActionReference();
		var rootIdx = rootSets[i][0];
		
		var layerName = getLayerNameByIndex(rootIdx);
		refRn.putIndex(charIDToTypeID('Lyr '), rootIdx);
		//���root group
		var list4 = new ActionList();
		list4.putReference( refRn );
		var desc205 = new ActionDescriptor();
		desc205.putList( charIDToTypeID( "null" ), list4 );			
		executeAction( charIDToTypeID( "Shw " ), desc205, DialogModes.NO );
		
		//�I���ϼh
		var ref68 = new ActionReference();
		ref68.putIndex( charIDToTypeID( "Lyr " ), rootIdx );
		var desc71 = new ActionDescriptor();
		desc71.putReference( charIDToTypeID( "null" ), ref68 );
		executeAction( charIDToTypeID( "slct" ), desc71, DialogModes.NO );

		
		//�Y���B�n�N��_��
		if(hasLayerMask(rootIdx)){		
			//����B�n
			var ref153 = new ActionReference();
			ref153.putProperty( charIDToTypeID( "Chnl" ), charIDToTypeID( "fsel" ) );
			
			var ref154 = new ActionReference();
			ref154.putEnumerated( charIDToTypeID( "Chnl" ), charIDToTypeID( "Chnl" ), charIDToTypeID( "Msk " ) );
			ref154.putIndex(charIDToTypeID('Lyr '), rootIdx);

			
			var desc146 = new ActionDescriptor();
			desc146.putReference( charIDToTypeID( "null" ), ref153 );
			desc146.putReference( charIDToTypeID( "T   " ), ref154 );
			executeAction( charIDToTypeID( "setd" ), desc146, DialogModes.NO );
			
			cropToSelection();
		}
		if(hasVectorMask()){			
			var ref259 = new ActionReference();
			ref259.putEnumerated( charIDToTypeID( "Path" ), charIDToTypeID( "Path" ), stringIDToTypeID( "vectorMask" ) );
			ref259.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
			
			var desc261 = new ActionDescriptor();
			desc261.putReference( charIDToTypeID( "null" ), ref259 );
			executeAction( charIDToTypeID( "slct" ), desc261, DialogModes.NO );	

			cropToSelection();
		}		
		
		if (rootSets[i].length > 1){
			for(j in rootSets[i]){
				if(j == 0) continue;
				var refB = new ActionReference();
				refB.putIndex(charIDToTypeID('Lyr '), rootSets[i][j]);
				var descBn = executeActionGet(refB);
				var layerName = descBn.getString(charIDToTypeID('Nm  ')).split(' ')[1];
				//���branch group
				var listB = new ActionList();
				listB.putReference( refB );
				var descB = new ActionDescriptor();
				descB.putList( charIDToTypeID( "null" ), listB );
				executeAction( charIDToTypeID( "Shw " ), descB, DialogModes.NO );

				// �Y�e�� / �h�H��Ƨ��W�٥[�J�s�ɸ��|
				if(descBn.getString(charIDToTypeID('Nm  ')).split(' ')[0] == "/"){
					midPath = "/" + layerName;
					layerName = getLayerNameByIndex(rootIdx);
					// slashParents[]
				}

				saveToPNG(layerName,rootIdx);
				//����branch
				executeAction( charIDToTypeID( "Hd  " ), descB, DialogModes.NO );
			}
		}else{
			saveToPNG(layerName,rootIdx);
		}
		
		//�p�G��eroot���B�n��crop�N�^�_�W���
		if(hasVectorMask(rootIdx) || hasLayerMask(rootIdx)){
			var desc264 = new ActionDescriptor();
			var ref263 = new ActionReference();
			ref263.putOffset( charIDToTypeID( "HstS" ), -2 );
			desc264.putReference( charIDToTypeID( "null" ), ref263 );
			executeAction( charIDToTypeID( "slct" ), desc264, DialogModes.NO );
		}
		//���ùϼh
		executeAction( charIDToTypeID( "Hd  " ), desc205, DialogModes.NO );		
	}
	t = new Date().getTime() - t;
	alert('end \n time: '+ t/1000 + ' sec')
}


function saveToPNG(layerName,rootIdx){
	var tempPath = new Folder(savePath + midPath);
	if(!tempPath.exists) tempPath.create();
	// pngName = tempPath + "/"+ layerName.toLowerCase() + ".png"
	var groupName = getLayerNameByIndex(rootIdx);
	if(groupName.split(' ')[0] == "/"){
		pngName = tempPath + "/"+ groupName.split(' ')[1] + "/" + layerName + ".png"
	} else {
		pngName = tempPath + "/"+ layerName + ".png"
	}
	
	doc.exportDocument(new File(pngName), ExportType.SAVEFORWEB, opts);
	midPath = "";
};

function replaceText(From, To) {
	var desc = new ActionDescriptor();
	var ref = new ActionReference();
	ref.putProperty(stringIDToTypeID('property'), stringIDToTypeID('replace'));
	ref.putEnumerated(charIDToTypeID('TxLr'), charIDToTypeID('Ordn'), stringIDToTypeID('allEnum'));
	desc.putReference(charIDToTypeID('null'), ref);
	
	var desc2 = new ActionDescriptor();
	desc2.putString(stringIDToTypeID('find'), From);
	desc2.putString(stringIDToTypeID('replace'), To);
	//If checkAll == true all text layers are scaned and changed if a match is found
	desc2.putBoolean(stringIDToTypeID('checkAll'), true);
	desc2.putBoolean(charIDToTypeID('Fwd '), true);
	desc2.putBoolean(stringIDToTypeID('caseSensitive'), false);
	desc2.putBoolean(stringIDToTypeID('wholeWord'), false);
	desc2.putBoolean(stringIDToTypeID('ignoreAccents'), true);
	
	desc.putObject(charIDToTypeID('Usng'), stringIDToTypeID('findReplace'), desc2);
	try {
		executeAction(stringIDToTypeID('replace'), desc, DialogModes.NO);
	} catch (e) {}
};

function getLayerSets() { 
	var ref = new ActionReference();
	ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID('NmbL'));
	ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
	var count = executeActionGet(ref).getInteger(charIDToTypeID('NmbL')) + 1;
	var rootLsets = [];
	var nested = 0;
	var rootTemp = [];
	try {
		activeDocument.backgroundLayer;
		var i = 0;
	} catch (e) {
		var i = 1;
	};
	//loop �Ҧ��ϼh
	for (i; i < count; i++) {
		if (i == 0)	continue;	//continue ���U�������檽���^for����P�_
		ref = new ActionReference();
		ref.putIndex(charIDToTypeID('Lyr '), i);
		var desc = executeActionGet(ref);
		var layerName = desc.getString(charIDToTypeID('Nm  '));
		//���e�ϼh����ƪ��A
		var layerType = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID('layerSection')));
		
		//�J��"��Ƨ�����"�N+1
		if(layerType == 'layerSectionEnd') nested ++;
		//�Y�J��"��Ƨ��}�l" �B �b�_�����N-1
		else if(layerType == 'layerSectionStart' && nested > 1) nested--;
		//�Y�J��"��Ƨ��}�l" �B �b�̥~�h �B �W�٫e�󤣬� -
		else if(layerType == 'layerSectionStart' && (nested-1) == 0 && layerName.split(' ')[0] != '-' ) {
			hideLayer(ref);
			//����Ҧ��ĪG
			//��� root group(i)�A���ei�[��Ȧs�}�C�̫e��
			rootTemp.unshift(i);
			//��@��� root group �����F��ǵ� rootLsets
			rootLsets.push(rootTemp);
			// alert(rootTemp)	
			rootTemp = [];
			nested = 0;		
		}else if(layerType == 'layerSectionStart' && (nested-1) == 0 && layerName.split(' ')[0] == '-' ) {
			//�Y�J��"��Ƨ��}�l" �B �b�̥~�h �B �W�٫e�� -�A�h�N��Ӹ�Ƨ�����
			hideLayer(ref);			
			rootTemp = [];
			nested = 0;		
		}
		
		//�e�󰻴�
		if(layerName.split(' ')[0] == '-' ){
			hideLayer(ref);
		}else if(layerName.split(' ')[0] == '*' ){
			hideLayer(ref);
			rootTemp.push(i);
		}else if(layerName.split(' ')[0] == '/' ){
			hideLayer(ref);
			rootTemp.push(i);
		}
		
		//var isLayerSet = (layerType == 'layerSectionContent') ? false : true;
		//if (isLayerSet)	Lsets.push(i);
	};
	return rootLsets;
};

function hideLayer(ref){
	//���ùϼh
	var list4 = new ActionList();
	list4.putReference( ref );
	var desc205 = new ActionDescriptor();
	desc205.putList( charIDToTypeID( "null" ), list4 );			
	executeAction( charIDToTypeID( "Hd  " ), desc205, DialogModes.NO );

}


///////////////////////////////////////////////////////////////////////////////   
// Function: hasLayerMask   
// Usage: see if there is a raster layer mask   
// Input: <none> Must have an open document   
// Return: true if there is a vector mask   
///////////////////////////////////////////////////////////////////////////////   
function hasLayerMask(index) {
	var hasLayerMask = false;
	try {
		var ref = new ActionReference();
		var keyUserMaskEnabled = app.charIDToTypeID('UsrM');
		ref.putIndex(charIDToTypeID('Lyr '), index);
		ref.putProperty(app.charIDToTypeID('Prpr'), keyUserMaskEnabled);
		ref.putEnumerated(app.charIDToTypeID('Lyr '), app.charIDToTypeID('Ordn'), app.charIDToTypeID('Trgt'));
		var desc = executeActionGet(ref);
		if (desc.hasKey(keyUserMaskEnabled)) {
			hasLayerMask = true;
		}
	} catch (e) {
		hasLayerMask = false;
	}
	return hasLayerMask;
}
///////////////////////////////////////////////////////////////////////////////   
// Function: hasVectorMask   
// Usage: see if there is a vector layer mask   
// Input: <none> Must have an open document   
// Return: true if there is a vector mask   
///////////////////////////////////////////////////////////////////////////////   
function hasVectorMask() {   
var hasVectorMask = false;   
try {   
var ref = new ActionReference();   
var keyVectorMaskEnabled = app.stringIDToTypeID( 'vectorMask' );   
var keyKind = app.charIDToTypeID( 'Knd ' );   
ref.putEnumerated( app.charIDToTypeID( 'Path' ), app.charIDToTypeID( 'Ordn' ), keyVectorMaskEnabled );   
var desc = executeActionGet( ref );   
if ( desc.hasKey( keyKind ) ) {   
var kindValue = desc.getEnumerationValue( keyKind );   
if (kindValue == keyVectorMaskEnabled) {   
hasVectorMask = true;   
}   
}   
}catch(e) {   
hasVectorMask = false;   
}   
return hasVectorMask;   
}   

function getNamesPlusIDs() {
	var ref = new ActionReference();
	ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
	var count = executeActionGet(ref).getInteger(charIDToTypeID('NmbL')) + 1;
	var Names = [];
	try {
		activeDocument.backgroundLayer;
		var i = 0;
	} catch (e) {
		var i = 1;
	};
	for (i; i < count; i++) {
		if (i == 0)
			continue;
		ref = new ActionReference();
		ref.putIndex(charIDToTypeID('Lyr '), i);
		var desc = executeActionGet(ref);
		var layerName = desc.getString(charIDToTypeID('Nm  '));
		var Id = desc.getInteger(stringIDToTypeID('layerID'));
		var list = desc.getList( stringIDToTypeID( 'targetLayers'));
		if (layerName.match(/^<\/Layer group/))
			continue;
		var layerType = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID('layerSection')));
		var isLayerSet = (layerType == 'layerSectionContent') ? false : true;
		Names.push([[Id], [layerName], [isLayerSet], [list]]);
	};
	return Names;
};

function getLayerLayerSectionByIndex(index) {
	var ref = new ActionReference();
	ref.putProperty(stringIDToTypeID('property'), stringIDToTypeID('layerSection'));
	ref.putIndex(stringIDToTypeID('layer'), index);
	return typeIDToStringID(executeActionGet(ref).getEnumerationValue(stringIDToTypeID('layerSection')));
};
function getLayerNameByIndex(index) {
	var ref = new ActionReference();
	ref.putIndex(charIDToTypeID('Lyr '), index);
	return executeActionGet(ref).getString(charIDToTypeID('Nm  '));
};
function skipNestedSets(layerIndex) {
	var isEnd = false;
	layerIndex = app.activeDocument.layers[app.activeDocument.layers.length - 1].isBackgroundLayer ? layerIndex - 2 : layerIndex;
	while (!isEnd) {
		layerIndex--;
		if (getLayerLayerSectionByIndex(layerIndex) == 'layerSectionStart')
			layerIndex = skipNestedSets(layerIndex);
		isEnd = getLayerNameByIndex(layerIndex) == '</Layer group>' ? true : false;
	}
	return layerIndex - 1;
};
function getChildIndex(idx, skipNested) {
	var layerSetIndex = idx;
	var isEndOfSet = false;
	var layerIndexArray = [];
	while (!isEndOfSet) {
		layerSetIndex--;
		if (getLayerLayerSectionByIndex(layerSetIndex) == 'layerSectionStart' && skipNested) {
			layerSetIndex = skipNestedSets(layerSetIndex);
		}
		if (getLayerLayerSectionByIndex(layerSetIndex) == undefined)
			break;
		isEndOfSet = getLayerNameByIndex(layerSetIndex) == '</Layer group>' ? true : false;
		if (!isEndOfSet)
			layerIndexArray.push(layerSetIndex);
	}
	
	return layerIndexArray;
};

function cropToSelection() {
	try {
		activeDocument.crop(activeDocument.selection.bounds);
	} catch (e) {}
}

//=============�H�U��Reset Text Form ��
function ResetTextForm(){
	var ref = new ActionReference();
	ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') ); 
	var desc = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));
	var textSize =  desc.getList(stringIDToTypeID('textStyleRange')).getObjectValue(0).getObjectValue(stringIDToTypeID('textStyle')).getDouble (stringIDToTypeID('size'));
	//alert(desc.getList(stringIDToTypeID('textStyleRange')).getObjectValue(0).getObjectValue(stringIDToTypeID('textStyle')).getDouble (stringIDToTypeID('leading')))
	
	if (desc.hasKey(stringIDToTypeID('transform'))) {
		var mFactor = desc.getObjectValue(stringIDToTypeID('transform')).getUnitDoubleValue (stringIDToTypeID('yy') );
		var obounds = bounds();
		trans(1/mFactor*100);
		
		var autoLeading = desc.getList(stringIDToTypeID('textStyleRange')).getObjectValue(0).getObjectValue(stringIDToTypeID('textStyle')).getBoolean (stringIDToTypeID('autoLeading'));
		if(!autoLeading) var leading = desc.getList(stringIDToTypeID('textStyleRange')).getObjectValue(0).getObjectValue(stringIDToTypeID('textStyle')).getDouble (stringIDToTypeID('leading'));
		else leading = 0;
		// alert(textSize+',  '+leading+',  '+mFactor);
		// alert(typeof(textSize)+',  '+typeof(leading)+',  '+typeof(mFactor));
		resizeTxtSize((textSize*mFactor),(leading*mFactor));
		var nbounds = bounds();
		var yo = obounds[0]-nbounds[0];
		var xo = obounds[1]-nbounds[1];
		offset(xo,yo)
	}
	return Number(textSize);
};

function bounds(){
	var ref = new ActionReference()
	ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") )
	var action = executeActionGet(ref)
	//var textKey = action.getObjectValue(stringIDToTypeID('textKey'))
	var bounds = action.getObjectValue(stringIDToTypeID('bounds'))
	var top= bounds.getUnitDoubleValue (stringIDToTypeID('top'))
	var left= bounds.getUnitDoubleValue (stringIDToTypeID('left'))
	var right = bounds.getUnitDoubleValue (stringIDToTypeID('right'))
	var bottom = bounds.getUnitDoubleValue (stringIDToTypeID('bottom'))
	//alert(top+','+left+','+right+','+bottom)
	var bounds = []
	bounds.push(top,left,right,bottom);
	return bounds;
}

function offset(xo,yo){
	var ref33 = new ActionReference();
	ref33.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
	
	var desc38 = new ActionDescriptor();
	desc38.putUnitDouble( charIDToTypeID( "Hrzn" ), charIDToTypeID( "#Rlt" ), xo );
	desc38.putUnitDouble( charIDToTypeID( "Vrtc" ), charIDToTypeID( "#Rlt" ), yo );
	
	var desc37 = new ActionDescriptor();
	desc37.putReference( charIDToTypeID( "null" ), ref33 );
	desc37.putEnumerated( charIDToTypeID( "FTcs" ), charIDToTypeID( "QCSt" ), charIDToTypeID( "Qcsa" ) );	
	desc37.putObject( charIDToTypeID( "Ofst" ), charIDToTypeID( "Ofst" ), desc38 );
	executeAction( charIDToTypeID( "Trnf" ), desc37, DialogModes.NO );

}


function trans(scale){	
	var ref33 = new ActionReference();
	ref33.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
	
	var desc37 = new ActionDescriptor();
	desc37.putReference( charIDToTypeID( "null" ), ref33 );
	desc37.putEnumerated( charIDToTypeID( "FTcs" ), charIDToTypeID( "QCSt" ), charIDToTypeID( "Qcsa" ) );

	desc37.putUnitDouble( charIDToTypeID( "Wdth" ), charIDToTypeID( "#Prc" ), scale );
	desc37.putUnitDouble( charIDToTypeID( "Hght" ), charIDToTypeID( "#Prc" ), scale );
	
	desc37.putEnumerated( charIDToTypeID( "Intr" ), charIDToTypeID( "Intp" ), charIDToTypeID( "Bcbc" ));
	executeAction( charIDToTypeID( "Trnf" ), desc37, DialogModes.NO );
}

function resizeTxtSize(resize,leading){
	//alert('in txtsize,'+resize+','+leading)
	var ref3 = new ActionReference();
	ref3.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID('textStyle'));
	ref3.putEnumerated(charIDToTypeID("TxLr"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
	
	var desc5 = new ActionDescriptor();
	//desc5.putInteger(stringIDToTypeID("textOverrideFeatureName"), 808465458);
	//desc5.putInteger(stringIDToTypeID("typeStyleOperationType"), 3);
	desc5.putUnitDouble(charIDToTypeID("Sz  "), charIDToTypeID("#Pxl"), resize);
	
	var desc4 = new ActionDescriptor();
	desc4.putReference(charIDToTypeID("null"), ref3);
	
	if(leading == 0) desc5.putBoolean( stringIDToTypeID( "autoLeading" ), true );
	else {
		desc5.putBoolean( stringIDToTypeID( "autoLeading" ), false );
		desc5.putUnitDouble( charIDToTypeID( "Ldng" ), charIDToTypeID( "#Pxl" ), leading );
	}
	desc4.putObject(charIDToTypeID("T   "), charIDToTypeID("TxtS"), desc5);
	executeAction(charIDToTypeID("setd"), desc4, DialogModes.NO);	
}