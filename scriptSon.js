var soundSpeed = 341;
var soundDuration = 5;
var cubePos = [0,0];

var soundScale = 0.25;

var lastPerturbation = 0;

function updatePerturbations(perturArray, deltaT, speed)
{
  lastPerturbation += deltaT;
  if(lastPerturbation > 0.1 && speed != 0)
    {
      newPert = spawnPerturbation(cubePos);
      perturArray.push(newPert);
      scene.add(newPert.mesh);
      
      lastPerturbation = 0;
    }
  for(var i = 0; i < perturArray.length; i++)
    {
      currPert = perturArray[i];

      if(currPert.lifespan > soundDuration)
        {
          scene.remove(currPert.mesh);
          perturArray.splice(i,1);
          i -= 1;
          delete currPert;
          continue;
        }
      currPert.lifespan += deltaT;
      pertSc = currPert.mesh.scale;
      currPert.mesh.scale.set(pertSc.x+deltaT*soundSpeed*soundScale,pertSc.y+deltaT*soundSpeed*soundScale,pertSc.z+deltaT*soundSpeed*soundScale);
      if(currPert.mesh.material.program != undefined)
        {
            currPert.mesh.material.uniforms.opacity.value = (1-Math.sqrt(currPert.lifespan/soundDuration));
            currPert.mesh.material.uniformsNeedUpdate = true;

        }
    }
    
}

function spawnPerturbation(pos)
{
  pertMesh = createPerturbationMesh(pos);
  pertMesh.material.uniformsNeedUpdate = true;
  return {mesh: pertMesh, lifespan: 0}
}

function createPerturbationMesh(pos)
{
  var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

  var segmentCount = 32,
    radius = 1,
    geometry = new THREE.Geometry(),
    lineMaterial = new MeshLineMaterial( {
						color: new THREE.Color( "rgb(255, 50, 50)" ),
						opacity: 0.75,
						resolution: resolution,
						lineWidth: 0.005,
						near: 1,
						far: 100000,
						depthTest: false,
						blending: THREE.NormalBlending,
						transparent: true,
						side: THREE.DoubleSide
					});

  for (var i = 0; i <= segmentCount; i++) {
      var theta = (i / segmentCount) * Math.PI * 2;
      geometry.vertices.push(
          new THREE.Vector3(
              Math.cos(theta) * radius,
              Math.sin(theta) * radius,
              0));            
  }
  var line = new MeshLine();
  line.setGeometry( geometry );
  line.material = lineMaterial;
  
  line_mesh = new THREE.Mesh( line.geometry, lineMaterial );
  line_mesh.position.x = pos[0];
  line_mesh.position.y = pos[1];
  return line_mesh;
}

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

var w = 640;
var h = 480;
var viewSize = h;
var aspectRatio = w / h;

_viewport = {
    viewSize: viewSize,
    aspectRatio: aspectRatio,
    left: (-aspectRatio * viewSize) / 2,
    right: (aspectRatio * viewSize) / 2,
    top: viewSize / 2,
    bottom: -viewSize / 2,
    near: -500,
    far: 500
}

var camera = new THREE.OrthographicCamera ( 
    _viewport.left, 
    _viewport.right, 
    _viewport.top, 
    _viewport.bottom, 
    _viewport.near, 
    _viewport.far 
);



var renderer = new THREE.WebGLRenderer();
renderer.setSize( 640, 480 );
renderer.domElement.id = "firstSim";
document.getElementById("firstContainer").appendChild( renderer.domElement );
var speedText = document.createElement("p");
speedText.id = "speedText";
speedText.appendChild(document.createTextNode("Vitesse : 0 m/s"));
document.getElementById("firstContainer").appendChild(speedText);

var geometry = new THREE.BoxGeometry( 12, 12, 12 );
var material = new THREE.MeshBasicMaterial( { color: 0x4444dd } );


var cube = new THREE.Mesh( geometry, material );
scene.add( cube );
//var gridHelper = new THREE.GridHelper(1000,20);
//scene.add(gridHelper);
//gridHelper.rotation.x = Math.PI/2;
camera.position.z = 5;

var t0 = Date.now();
var perturbations = [];



var animate = function () {
    requestAnimationFrame( animate );
    
    deltaT = (Date.now()-t0)/1000;
		var slider = document.getElementById("cubeSpeedSlider").value * soundScale;
    updatePerturbations(perturbations, deltaT, slider);
    cubePos[0] += deltaT*slider;
		speedText.innerHTML = "Vitesse : "+slider/soundScale+" m/s</br>Angle : " + 
			(slider/soundScale < soundSpeed ? "Aucune onde de choc" : (slider/soundScale == soundSpeed ? "Mur du son" : (Math.asin(soundSpeed/(slider/soundScale))+ " radians"))) ;
		camera.position.x = cubePos[0];
    cube.position.x = cubePos[0];
    t0 = Date.now();
  
    renderer.render(scene, camera);
};

animate();