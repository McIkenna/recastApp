
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import ReactPanel from "./ReactPanel";
import CanvasComp from "./CanvasComp";
import './canvas.css'

export const ParentComponent = () => {
    const mountRef = useRef(null);
    const [cubeInfos, setCubeInfos] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null)

    const sceneRef = useRef();
    const cameraRef = useRef();
    const rendererRef = useRef();
    const cubesRef = useRef([]);
    const positionsRef = useRef(new Map());
    const selectedRef = useRef({ id: null, color: 0xff9800 });

    const raycasterRef = useRef(new THREE.Raycaster());
    const pointerRef = useRef(new THREE.Vector2());
    const dragPlaneRef = useRef(new THREE.Plane());
    const dragOffsetRef = useRef(new THREE.Vector3());
    const dragIntersectionRef = useRef(new THREE.Vector3());
    const isDraggingRef = useRef(false);


    useEffect(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf7f7f7);
        sceneRef.current = scene;

        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        const dir = new THREE.DirectionalLight(0xffffff, 0.5);
        dir.position.set(5, 10, 7);
        scene.add(ambient, dir);

        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(0, 2, 8);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Ground Plane
        const groundGeo = new THREE.PlaneGeometry(30, 30);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0, roughness: 1 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        // Create cubes once
        const cubeCount = 4;
        const spacing = 2.2;
        const cubes = [];
        const infos = [];

        for (let i = 0; i < cubeCount; i++) {
            const geo = new THREE.BoxGeometry(1, 1, 1);
            const mat = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5)
            });
            const mesh = new THREE.Mesh(geo, mat);
            const x = (i - (cubeCount - 1) / 2) * spacing;

            mesh.position.set(x, 0.5, 0);
            mesh.name = `cube - ${i+1}`

            scene.add(mesh);

            const id = `${i + 1}`;
            cubes.push({ id, mesh });
            positionsRef.current.set(id,
                {
                    position: mesh.position.clone(),
                    color: mesh.material.color.clone()
                }); // saving the current position

            infos.push({
                id,
                title: `Cube ${i + 1}`,
                description: `This is the description for ${i + 1}`,
                mesh: mesh
            });
        }

        cubesRef.current = cubes;
        setCubeInfos(infos);

        // Handlers to select each cube in the data
        const onPointerDown = (event) => {
            const renderer = rendererRef.current;
            const camera = cameraRef.current;
            const raycaster = raycasterRef.current;
            const pointer = pointerRef.current;

            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(cubesRef.current.map(c => c.mesh));

            if (intersects.length > 0) {
                const hit = intersects[0].object;
                const found = cubesRef.current.find(c => c.mesh === hit);
                if (found) {
                    setSelectedId(found.id);
                    selectedRef.current.id = found.id;

                    isDraggingRef.current = true;

                    // created a drag plane parallel to ground through current position
                    dragPlaneRef.current.setFromNormalAndCoplanarPoint(
                        new THREE.Vector3(0, 1, 0),
                        hit.position
                    );

                    // compute offset so that the cube doesn't change positon suddenly
                    raycaster.ray.intersectPlane(dragPlaneRef.current, dragIntersectionRef.current);
                    dragOffsetRef.current.subVectors(hit.position, dragIntersectionRef.current);

                    event.preventDefault();
                }
            } else {
                setSelectedId(null);
                selectedRef.current.id = null;
                isDraggingRef.current = false;
            }
        };

        const onPointerMove = (event) => {
            if (!isDraggingRef.current || !selectedRef.current.id) return;

            const renderer = rendererRef.current;
            const camera = cameraRef.current;
            const raycaster = raycasterRef.current;
            const pointer = pointerRef.current;

            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);

            if (raycaster.ray.intersectPlane(dragPlaneRef.current, dragIntersectionRef.current)) {
                const id = selectedRef.current.id;
                const cubeObj = cubesRef.current.find(c => c.id === id);
                if (!cubeObj) return;

                cubeObj.mesh.position.copy(
                    dragIntersectionRef.current.clone().add(dragOffsetRef.current)
                );

                // keep above ground
                cubeObj.mesh.position.y = Math.max(cubeObj.mesh.position.y, 0.5);

                // persist its new position and color
                // positionsRef.current.set(id, cubeObj.mesh.position.clone());
                positionsRef.current.set(id, {
                    position: cubeObj.mesh.position.clone(),
                    color: cubeObj.mesh.material.color.clone()
                });
            }
        };

        const onPointerUp = () => {
            isDraggingRef.current = false;
            setSelectedColor(null)
        };

        const onPressButton = (event) => {
            const id = selectedRef.current.id;
            if (!id) return;

            const cubeObj = cubesRef.current.find(c => c.id === id);
            if (!cubeObj) return;

            const cube = cubeObj.mesh;
            const moveAmount = 0.1;

            switch (event.key) {
                case 'ArrowUp': cube.position.z -= moveAmount; break;
                case 'ArrowDown': cube.position.z += moveAmount; break;
                case 'ArrowLeft': cube.position.x -= moveAmount; break;
                case 'ArrowRight': cube.position.x += moveAmount; break;
                case 'W':
                case 'w': cube.position.y += moveAmount; break;
                case 'S':
                case 's': cube.position.y -= moveAmount; break;
                default: return;
            }

            cube.position.y = Math.max(cube.position.y, 0.5);
            // positionsRef.current.set(id, cube.position.clone());
            positionsRef.current.set(id, {
                position: cube.position.clone(),
                color: cube.material.color.clone()
            });
        };

        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        renderer.domElement.addEventListener('pointermove', onPointerMove);
        renderer.domElement.addEventListener('pointerup', onPointerUp);
        document.addEventListener('keydown', onPressButton);

        let rafId;
        const animate = () => {
            rafId = requestAnimationFrame(animate);

            cubesRef.current.forEach(({ id, mesh }) => {
                const saved = positionsRef.current.get(id);
                if (saved) {
                    mesh.position.copy(saved.position);
                    mesh.material.color.copy(saved.color);
                }
                if (id === selectedRef.current.id) {
                    mesh.scale.set(1.3, 1.3, 1.3);
                    mesh.material.color.set(selectedRef.current.color);
                    positionsRef.current.set(id, {
                        position: mesh.position.clone(),
                        color: mesh.material.color.clone()
                    });
                } else {
                    mesh.scale.set(1, 1, 1);
                    // mesh.material.color.set(0xff9800);
                }
            });

            renderer.render(scene, camera);
        };
        animate();

        const onResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        return () => {

            cancelAnimationFrame(rafId);
            renderer.domElement.removeEventListener('pointerdown', onPointerDown);
            renderer.domElement.removeEventListener('pointermove', onPointerMove);
            renderer.domElement.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('keydown', onPressButton);
            window.removeEventListener('resize', onResize);

            cubesRef.current.forEach(c => {
                c.mesh.geometry.dispose();
                if (Array.isArray(c.mesh.material)) c.mesh.material.forEach(m => m.dispose());
                else c.mesh.material.dispose();
                scene.remove(c.mesh);
            });
            groundGeo.dispose();
            groundMat.dispose();
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);


    useEffect(() => {
        selectedRef.current.id = selectedId;
        // selectedRef.current.color = positionsRef.current.color
        selectedRef.current.color = new THREE.Color().setHSL(Math.random(), 0.6, 0.5)
    }, [selectedId]);

    useEffect(() => {
        selectedRef.current.color = selectedColor;
    }, [selectedColor]);

    const colorChangeHandler = (color) => {
        setSelectedColor(color);
    }

    const selectedInfo = cubeInfos.find(c => c.id === selectedId) || null;

    return (
        <div>
            <div className="container">
                <div className='canvas-element'>

                    <CanvasComp
                        mountRef={mountRef}
                        colorChangeHandler={colorChangeHandler}
                        selectedColor={selectedColor}

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
