/* ============================================================
   three-globe.js — Interactive Realistic 3D Globe
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  try {
    if (typeof THREE === 'undefined') return;

    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    /* ---------- Scene, Camera, Renderer ---------- */
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 11.5;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /* ---------- Lights ---------- */
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 8);
    scene.add(dirLight);

    var pointLight = new THREE.PointLight(0xFF6B35, 1.2, 25);
    pointLight.position.set(0, 0, 8);
    scene.add(pointLight);

    /* ---------- Globe Group ---------- */
    var globeGroup = new THREE.Group();
    scene.add(globeGroup);

    /* ---------- Globe Sphere with Textures ---------- */
    var globeGeometry = new THREE.SphereGeometry(4.5, 64, 64);
    
    // Premium glossy dark material (phong) responding to light
    var globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x111625,
      shininess: 25,
      bumpScale: 0.08,
      specular: 0x222222
    });

    var globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globe);

    // Texture loaders for realistic Earth satellite view
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-night.jpg',
      function (tex) {
        globeMaterial.map = tex;
        globeMaterial.color.setHex(0xffffff); // reset tint when texture is loaded
        globeMaterial.needsUpdate = true;
      },
      undefined,
      function () {
        // Fallback: procedural styling if texture fails
        globeMaterial.wireframe = false;
        globeMaterial.color.setHex(0x131a35);
      }
    );

    textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-topology.png',
      function (topo) {
        globeMaterial.bumpMap = topo;
        globeMaterial.needsUpdate = true;
      }
    );

    /* ---------- Atmosphere Glow ---------- */
    var atmosphereGeometry = new THREE.SphereGeometry(4.65, 32, 32);
    var atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF6B35,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    var atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphere);

    /* ---------- Real-World Coordinates (Indian Chapters) ---------- */
    var CITIES = [
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
      { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
      { name: 'Pune', lat: 18.5204, lng: 73.8567 },
      { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
      { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 }
    ];

    function latLngToVector3(lat, lng, radius) {
      var phi = (90 - lat) * (Math.PI / 180);
      var theta = (lng + 180) * (Math.PI / 180);
      var x = -(radius * Math.sin(phi) * Math.sin(theta));
      var y = radius * Math.cos(phi);
      var z = radius * Math.sin(phi) * Math.cos(theta);
      return new THREE.Vector3(x, y, z);
    }

    /* ---------- Add City Markers ---------- */
    var dots = [];
    var dotGroup = new THREE.Group();
    var dotMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF6B35
    });

    CITIES.forEach(function (city) {
      var pos = latLngToVector3(city.lat, city.lng, 4.52);
      var dotGeo = new THREE.SphereGeometry(0.09, 16, 16);
      var m = new THREE.Mesh(dotGeo, dotMaterial.clone());
      m.position.copy(pos);
      m.userData = { name: city.name };
      dots.push(m);
      dotGroup.add(m);
    });
    globeGroup.add(dotGroup);

    /* ---------- Arc Lines Connecting Cities ---------- */
    var lineGroup = new THREE.Group();
    var lineMaterial = new THREE.LineBasicMaterial({
      color: 0xFFD166,
      opacity: 0.35,
      transparent: true
    });

    function createArc(p1, p2) {
      var mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      // Lift the midpoint above the surface for curved paths
      var dist = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(4.5 + dist * 0.25);

      var curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      var points = curve.getPoints(24);
      var geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, lineMaterial);
    }

    // Connect some pairs of adjacent/important cities
    var connections = [
      [0, 1], [0, 2], [0, 6], [1, 5], [1, 7], [2, 4], [2, 8], [3, 5], [8, 0], [9, 1]
    ];
    connections.forEach(function (c) {
      var arc = createArc(dots[c[0]].position.clone(), dots[c[1]].position.clone());
      lineGroup.add(arc);
    });
    globeGroup.add(lineGroup);

    // Orient globe so India is facing the camera initially
    globeGroup.rotation.y = 2.1;
    globeGroup.rotation.x = 0.35;

    /* ---------- Interaction: Drag-to-Rotate ---------- */
    var isDragging = false;
    var previousMousePosition = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', function (e) {
      if (isDragging) {
        var deltaMove = {
          x: e.clientX - previousMousePosition.x,
          y: e.clientY - previousMousePosition.y
        };
        globeGroup.rotation.y += deltaMove.x * 0.005;
        globeGroup.rotation.x += deltaMove.y * 0.005;
      }
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', function () {
      isDragging = false;
    });

    // Touch Support
    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    canvas.addEventListener('touchmove', function (e) {
      if (isDragging && e.touches.length === 1) {
        var deltaMove = {
          x: e.touches[0].clientX - previousMousePosition.x,
          y: e.touches[0].clientY - previousMousePosition.y
        };
        globeGroup.rotation.y += deltaMove.x * 0.005;
        globeGroup.rotation.x += deltaMove.y * 0.005;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    canvas.addEventListener('touchend', function () {
      isDragging = false;
    });

    /* ---------- Raycaster: Hover tooltip on cities ---------- */
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    var tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'rgba(10, 10, 26, 0.9)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '0.4rem 0.8rem';
    tooltip.style.borderRadius = '6px';
    tooltip.style.border = '1px solid var(--primary, #FF6B35)';
    tooltip.style.fontSize = '0.8rem';
    tooltip.style.fontFamily = 'Outfit, Inter, sans-serif';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    tooltip.style.zIndex = '9999';
    tooltip.style.boxShadow = '0 4px 15px rgba(255,107,53,0.3)';
    tooltip.style.backdropFilter = 'blur(10px)';
    document.body.appendChild(tooltip);

    window.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      tooltip.style.left = (e.clientX + 15) + 'px';
      tooltip.style.top = (e.clientY + 15) + 'px';
    });

    /* ---------- Animation Clock ---------- */
    var clock = new THREE.Clock();

    /* ---------- Animation Loop ---------- */
    function animate() {
      requestAnimationFrame(animate);

      var elapsed = clock.getElapsedTime();

      // Gentle auto-rotation when user is not dragging
      if (!isDragging) {
        globeGroup.rotation.y += 0.0015;
      }

      // Pulse dots slightly over time
      dots.forEach(function (d, idx) {
        var scale = 1 + 0.25 * Math.sin(elapsed * 2 + idx);
        d.scale.setScalar(scale);
      });

      // Raycast test for hover highlights
      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(dots);

      if (intersects.length > 0) {
        var hoverObj = intersects[0].object;
        hoverObj.scale.setScalar(2.2);
        hoverObj.material.color.setHex(0xFFD166); // Turn bright gold on hover

        tooltip.textContent = '🕊️ NayePankh ' + hoverObj.userData.name + ' Chapter';
        tooltip.style.display = 'block';
        document.body.style.cursor = 'pointer';
      } else {
        // Reset dot colors
        dots.forEach(function (d) {
          d.material.color.setHex(0xFF6B35);
        });
        tooltip.style.display = 'none';
        document.body.style.cursor = '';
      }

      // Slowly move directional light to create dynamic lighting
      dirLight.position.x = 5 + Math.sin(elapsed * 0.3) * 3;
      dirLight.position.z = 8 + Math.cos(elapsed * 0.3) * 3;

      renderer.render(scene, camera);
    }

    animate();

    /* ---------- Handle Canvas Resize ---------- */
    window.addEventListener('resize', function () {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

  } catch (err) {
    console.warn('three-globe.js: Could not initialise 3D globe —', err.message);
  }
})();
