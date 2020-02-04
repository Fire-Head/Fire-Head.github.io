var tIdx =
{
	'jBinary.all': 'File',
	'jBinary.littleEndian': true,

	FastFileDesc:
	{
		pos: 'uint32',
		size: 'uint32'
	},
	
	File: {  
		Num: 'uint32',
		Files: ['array', 'FastFileDesc', 'Num'],
	}
};

var tModel =
{
	'jBinary.all': 'File',
	'jBinary.littleEndian': true,
	
	Vector3D:
	{
		x : 'int16',
		y : 'int16',
		z : 'int16',
	},
	
	UV:
	{
		u : 'int16',
		v : 'int16',
	},
	
	Indexes:
	{
		va : 'int16',
		vb : 'int16',
		vc : 'int16',
		
		ta : 'int16',
		tb : 'int16',
		tc : 'int16',
	},

	File: {
		headerSize : 'int16',
		numFrames  : 'int16',
		numVerts  : 'int16',
		numUVs  : 'int16',
		numIndexes  : 'int16',
		sizeOfVertsData  : 'int16',
		w6  : 'int16',
				
		vertices: ['array', ['array', 'Vector3D', 'numVerts'], 'numFrames'],
		texCoords: ['array', 'UV', 'numUVs'],
		indexes: ['array', 'Indexes', 'numIndexes'],
		
		numTextures : 'int16',
		width : 'int16',
		height : 'int16',
		
		textures: ['array', ['array', ['array', 'uint16', 'width'], 'height'], 'numTextures'],
	}
};

var modelsinfo = null;

function LoadData(mid)
{
	jBinary.load('tes/models.huge', tModel).then(function(jb)
	{
		if ( modelsinfo.Files[mid].size != 0 )
		{
			var model = jb.seek(modelsinfo.Files[mid].pos, function() { return jb.read('File');});
			window.viewer.addMdl(model);
		}
    });
	
}
 
var scene, camera, renderer;
var light, controls;

var geometry;

var MapViewer = function() {
    this.init();
    this.animate();
};

MapViewer.prototype.init = function() {

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor( 0x000000 );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    
	this.container = document.createElement( 'div' );
	document.body.appendChild( this.container );			
	
	this.container.appendChild( this.renderer.domElement );
	
	this.renderer.outputEncoding = THREE.sRGBEncoding;
	this.renderer.shadowMap.enabled = true;
	this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	this.stats = new Stats();
	this.container.appendChild( this.stats.dom );
	
	this.playbackConfig =
	{
		
	};
	
	this.gui = new dat.GUI();

	
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .01, 1000)
	this.camera.position.set( 0.075, 2.075, 4.55 );


	this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
	
				
	this.controls.enableDamping = true
	this.controls.dampingFactor = 0.2
	this.controls.zoomSpeed = 1.4
	this.controls.rotateSpeed = 0.6
	this.controls.enableKeys = false

    this.scene = new THREE.Scene();
	
	var grid = new THREE.GridHelper( 50, 50, 0xffffff, 0x555555 );
	this.scene.add( grid );
				
	this.geo = null;
	this.mesh = null;
	
    
    var light = new THREE.AmbientLight( 0x888888 );
    light.position.set( 1, 1, 1 );
    this.scene.add( light );

    var light1 = new THREE.DirectionalLight(0xffffff, 0.3);
    light1.position.set(-1, -2, 3).normalize();
    this.scene.add(light1);

    var light2 = new THREE.DirectionalLight(0xffffff, 0.3);
    light2.position.set(1, 2, 3).normalize();
    this.scene.add(light2);

	this.clock = new THREE.Clock();
	
	window.addEventListener('resize', this.resize, false)
	
	
};

MapViewer.prototype.setupModelsGUI = function(modeldefs)
{
	modeldefs.sort(function(a, b)
	{
		if(a.NAME.toLowerCase() < b.NAME.toLowerCase()) { return -1; }
		if(a.NAME.toLowerCase() > b.NAME.toLowerCase()) { return 1; }
		return 0;
	})

	var folder = this.gui.addFolder( "models" );

	var generateCallback = function ( index )
	{
		return function ()
		{
			LoadData( index );
		};
	};

	
	var n = 0;
	for ( var i = 0; i < modeldefs.length; i ++ )
	{
		var name = modeldefs[i].NAME;

		this.playbackConfig[ name ] = generateCallback( modeldefs[i].ID );
		folder.add( this.playbackConfig, name ).name( name );
	}
	
	folder.open();
}
			
MapViewer.prototype.animate = function() {
    requestAnimationFrame(this.animate.bind(this));
	this.render();
	this.stats.update();
};

MapViewer.prototype.render = function() {
	var delta = this.clock.getDelta();
	this.updateGeo(delta);
	this.renderer.render(this.scene, this.camera);
};

MapViewer.resize = function()
{
    this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize( window.innerWidth, window.innerHeight );
}

function CLUT4BitTo8Bit(pixel)
{
	return pixel | 16 * pixel;
}

function GetTexture(data, width, height)
{
	var texture = new THREE.Texture();
	
	{
		var useOffscreen = typeof OffscreenCanvas !== 'undefined';

		var canvas = useOffscreen ? new OffscreenCanvas( width, height ) : document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext( '2d' );
		var imageData = context.createImageData( width, height );

		{
			var i = 0;
			
			for ( var y = height-1; y >= 0; y-- )
			{

				for ( var x = 0; x < width; x++, i += 4 )
				{
					var pixel = data[y][x];
			
					var r = CLUT4BitTo8Bit(pixel & 15);
					var g = CLUT4BitTo8Bit((pixel>>4) & 15);
					var b = CLUT4BitTo8Bit((pixel>>8) & 15);
					var a = CLUT4BitTo8Bit((pixel>>12) & 15);		
			
					imageData.data[ i + 0 ] = b;
					imageData.data[ i + 1 ] = g;			
					imageData.data[ i + 2 ] = r;
					if (pixel == 0xF0F)
						imageData.data[ i + 3 ] = 0;
					else
						imageData.data[ i + 3 ] = 255;
				}
			}
		}
		
		context.putImageData( imageData, 0, 0 );
		texture.image = useOffscreen ? canvas.transferToImageBitmap() : canvas;
	}
	
	texture.needsUpdate = true;
			
	return texture;
}

MapViewer.prototype.addMdl = function(mdl)
{	
    var c = (255 << 16) + (0 << 8) + 255;
	this.geo = null;
	this.geo = new THREE.Geometry();

	var animid = 0;
	var animoffset = mdl.numVerts * animid;
	var lastffset = (mdl.numFrames -1) * mdl.numVerts;
	
	for ( var n = 0; n < mdl.numFrames; n++ )
	{
		for ( var i = 0; i < mdl.numVerts; i++ )
		{
			var vert = mdl.vertices[n][i];
			
			this.geo.vertices.push(new THREE.Vector3(fx8_8_to_float(vert.x), fx8_8_to_float(vert.y), fx8_8_to_float(vert.z)));
		}
	}
	
	for ( var i = 0; i < mdl.numIndexes; i++ )
	{
		var idx = mdl.indexes[i];
		
		var plane = new THREE.Plane();
		plane.setFromCoplanarPoints(this.geo.vertices[animoffset+idx.va], this.geo.vertices[animoffset+idx.vb], this.geo.vertices[animoffset+idx.vc]);
	
		var fc = new THREE.Face3(animoffset+idx.va, animoffset+idx.vb, animoffset+idx.vc, plane.normal, c);
		fc.vertexColors = [ c, c, c ];
		this.geo.faces.push(fc);
		
		var ta = mdl.texCoords[idx.ta];
		var tb = mdl.texCoords[idx.tb];
		var tc = mdl.texCoords[idx.tc];
		
		var uva = new THREE.Vector2(fx8_8_to_float(ta.u)/(mdl.width), 1.0 - (fx8_8_to_float(ta.v)/(mdl.height)));
		var uvb = new THREE.Vector2(fx8_8_to_float(tb.u)/(mdl.width), 1.0 - (fx8_8_to_float(tb.v)/(mdl.height)));
		var uvc = new THREE.Vector2(fx8_8_to_float(tc.u)/(mdl.width), 1.0 - (fx8_8_to_float(tc.v)/(mdl.height)));
		
		this.geo.faceVertexUvs[0].push([ uva, uvb, uvc ] );
	}
	
    this.geo.mergeVertices();
    this.geo.computeBoundingBox();
    this.geo.computeVertexNormals();
    this.geo.computeFaceNormals();
    
	var material = null;
	if (mdl.numTextures > 0)
	{
		var mp = GetTexture( mdl.textures[0], mdl.width, mdl.height );
		material = new THREE.MeshLambertMaterial( { map: mp, transparent: true } );
	}
	else
	{
		material = new THREE.MeshLambertMaterial( {  } );
	}
	

	if (this.mesh)
		this.scene.remove(this.mesh);
	this.mesh = null;
	
    this.mesh = new THREE.Mesh(this.geo, material);
	this.mesh.position.x = 0;
	this.mesh.position.y = 0;
	this.mesh.position.z = 0;
	this.mesh.rotateY( Math.PI );
	this.mesh.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
	
    this.scene.add(this.mesh);
};

MapViewer.prototype.updateGeo = function(delta) {

};

function loadText(filename, cb)
{
	let req = new XMLHttpRequest();
	req.open("GET", filename, true);
	req.responseType = "text";

	req.onload = function(oEvent){
		cb(req.response);
	};

	req.send(null);
}

function main() {
    window.viewer = new MapViewer();

	jBinary.load('tes/models.idx', tIdx).then(function(jb)
	{
        modelsinfo = jb.readAll();
		
		loadText('tes/models.txt', function(text)
		{
			let lines = text.split("\n");
			let data = [];
			
			for(let i = 0; i < lines.length; i++)
			{
				if (lines[i])
				{
					let line = lines[i].split(" ");
					
					let id = Number(line[0]);
					let name = line[4];
					
					if ( modelsinfo.Files[id].size != 0 )
						data.push({ID:id, NAME:name});
				}
			}
			
			window.viewer.setupModelsGUI(data);
			
		});
    });
	
	LoadData(58);
	
	console.log('loaded');
}

function fx8_8_to_float(fx)
{
	return (fx) / (1 << 8);
}