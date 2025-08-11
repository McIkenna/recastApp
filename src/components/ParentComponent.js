
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import ReactPanel from "./ReactPanel";
import CanvasComp from "./CanvasComp";
import './canvas.css'

export const ParentComponent = () => {
    const mountRef = useRef(null);
    const [cubeInfos, setCubeInfos] = useState([]); // {id, title, description}
    const [selectedId, setSelectedId] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null)


    useEffect(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf7f7f7);
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        const dir = new THREE.DirectionalLight(0xffffff, 0.5);


        dir.position.set(5, 10, 7);


        const container = mountRef.current;
        if (!container) return;
        // camera, renderer
        const width = container.clientWidth;
        const height = container.clientHeight;
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(0, 2, 8);


        // Adding lights to the scene
        scene.add(ambient);
        scene.add(dir);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        container.appendChild(renderer.domElement);


        // Create 3 cubes spaced out equally

        const cubeCount = 3
        const cubes = [];
        const infos = [];
        for (let i = 0; i < cubeCount; i++) {
            const geo = new THREE.BoxGeometry(1, 1, 1);
            const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5) });
            const mesh = new THREE.Mesh(geo, mat);

            // spread them out on X and Z
            const spacing = 2.2;
            const x = (i - (cubeCount - 1) / 2) * spacing;
            const z = 0;
            mesh.position.set(x, 0.5, z);

            scene.add(mesh);
            cubes.push({ id: `${i + 1}`, mesh });

            infos.push({
                id: `${i + 1}`,
                title: `Cube ${i + 1}`,
                description: `This is the description for ${i + 1}`
            });
        }
        // Save initial infos to state
        setCubeInfos(infos);

        // Ground (subtle)
        const groundGeo = new THREE.PlaneGeometry(30, 30);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0, roughness: 1 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        scene.add(ground);

        // Raycaster for click selection of Objects
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        function onPointerDown(event) {
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(cubes.map(c => c.mesh));
            if (intersects.length > 0) {
                const hit = intersects[0].object;
                const found = cubes.find(c => c.mesh === hit);
                if (found) {
                    // setSelectedPosition(0)
                    setSelectedId(found.id)
                };
            } else {
                setSelectedId(null);
            }
        }

        function onPressButton(event) {
            if (selectedId === null) return; // no cube selected
            const moveAmount = 0.1; // adjust movement speed

            const cube = cubes[selectedId - 1].mesh;
            switch (event.key) {
                case 'ArrowUp':
                    cube.position.z -= moveAmount;
                    break;
                case 'ArrowDown':
                    cube.position.z += moveAmount;
                    break;
                case 'ArrowLeft':
                    cube.position.x -= moveAmount;
                    break;
                case 'ArrowRight':
                    cube.position.x += moveAmount;
                    break;
                default:
                    break
            }
        }

        renderer.domElement.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onPressButton);


        let rafId;
        function animate() {
            rafId = requestAnimationFrame(animate);

            // rotate each cube a bit
            cubes.forEach((c, idx) => {
                // c.mesh.rotation.x += 0.006 + idx * 0.002;
                // c.mesh.rotation.y += 0.008 + idx * 0.003;
                // highlight selected
                if (c.id === selectedId) {
                    c.mesh.scale.set(1.3, 1.3, 1.3);
                    c.mesh.material.color.set(selectedColor);
                    // c.mesh.position.y = selectedPosition;
                } else {
                    c.mesh.scale.set(1, 1, 1);
                    c.mesh.material.color.set(0xff9800);
                }
            });

            renderer.render(scene, camera);
        }
        animate();

        // Resize handling
        function onResize() {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        window.addEventListener("resize", onResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(rafId);
            renderer.domElement.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("resize", onResize);
            cubes.forEach(c => {
                c.mesh.geometry.dispose();
                if (Array.isArray(c.mesh.material)) c.mesh.material.forEach(m => m.dispose());
                else c.mesh.material.dispose();
                scene.remove(c.mesh);
            });
            ground.geometry.dispose();
            ground.material.dispose();
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
        // NOTE: we intentionally depend on selectedId so the highlight updates
    }, [selectedId, selectedColor]);


    const colorChangeHander = (id) => {
        setSelectedColor(id)
    }

   

    const selectedInfo = cubeInfos.find(c => c.id === selectedId) || null;

    return (
        <div>
            <div className="container">
                <div className='canvas-element'>

                    <CanvasComp
                        mountRef={mountRef}
                        colorChangeHander={colorChangeHander}

                    />


                </div>
                <div className='reactpanel-element'>
                    <h2>Scene Panel</h2>

                    <ReactPanel
                        selectedInfo={selectedInfo}
                        selectedId={selectedId}
                    />
                </div>


            </div>
        </div>
    );
}
