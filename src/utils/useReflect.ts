import { useFBO } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Matrix4, Mesh, NearestFilter, PerspectiveCamera, Plane, Quaternion, UnsignedByteType, Vector3, Vector4 } from "three";
import { useShallow } from "zustand/react/shallow";
import { PackedMipMapGenerator } from "./csmMipmap/PackedMipMapGenerator";

interface MeshReflectorMaterialConfig {
  resolution: number;
  ignoreObjects: THREE.Object3D[];
}


const useReflect = (parent: Mesh, config: Partial<MeshReflectorMaterialConfig> = {}) => {


  const { resolution = 512, ignoreObjects = [] } = config;

  const { baseCamera, renderer, scene } = useThree(useShallow((state) => ({
    baseCamera: state.camera,
    renderer: state.gl,
    scene: state.scene,
  })));

  const reflectPlaneRef = useRef(new Plane())

  const reflectMatrixRef = useRef(new Matrix4())

  const cameraRef = useRef(new PerspectiveCamera())

  const renderTarget = useFBO(resolution, resolution, {
    type: UnsignedByteType,
  });

  const mipMaper = useMemo(() => new PackedMipMapGenerator(), [])

  const renderTargetMipMap = useFBO(resolution, resolution, {
    type: UnsignedByteType
  });


  const beforeRender = () => {

    const reflectPlane = reflectPlaneRef.current;
    const reflectMatrix = reflectMatrixRef.current;
    const camera = cameraRef.current;

    reflectPlane.set(new Vector3(0, 1, 0), 0);
    reflectPlane.applyMatrix4(parent.matrixWorld);
    camera.copy(baseCamera as PerspectiveCamera);
    const r = new Vector3(0, 0, 1).clone().negate();
    const o = baseCamera.getWorldPosition(new Vector3());
    r.reflect(reflectPlane.normal);
    const p = new Vector3();
    reflectPlane.projectPoint(o, p);
    const y = p.clone();
    y.sub(o), y.add(p), camera.position.copy(y);
    const d = new Vector3(0, 0, -1);
    d.applyQuaternion(
      baseCamera.getWorldQuaternion(new Quaternion())
    );
    d.add(o);
    const E = new Vector3();
    parent.getWorldPosition(E);
    E.sub(d);
    E.reflect(reflectPlane.normal).negate();
    E.add(parent.getWorldPosition(new Vector3()));
    camera.up.set(0, 1, 0);
    camera.applyQuaternion(
      baseCamera.getWorldQuaternion(new Quaternion())
    );
    camera.up.reflect(reflectPlane.normal);
    camera.lookAt(E);
    camera.updateMatrixWorld();
    const L = new Matrix4();
    L.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    L.multiply(camera.projectionMatrix);
    L.multiply(camera.matrixWorldInverse);
    reflectMatrix.copy(L);
    reflectPlane.applyMatrix4(camera.matrixWorldInverse);
    const k = new Vector4(
      reflectPlane.normal.x,
      reflectPlane.normal.y,
      reflectPlane.normal.z,
      reflectPlane.constant
    );
    const X = camera.projectionMatrix;
    const $ = new Vector4();
    $.x = (Math.sign(k.x) + X.elements[8]) / X.elements[0];
    $.y = (Math.sign(k.y) + X.elements[9]) / X.elements[5];
    $.z = -1;
    $.w = (1 + X.elements[10]) / X.elements[14];
    k.multiplyScalar(2 / k.dot($));
    X.elements[2] = k.x;
    X.elements[6] = k.y;
    X.elements[10] = k.z + 1;
    X.elements[14] = k.w;
    const Z = renderer.getRenderTarget();
    renderer.setRenderTarget(renderTarget);
    renderer.state.buffers.depth.setMask(true);
    renderer.autoClear === false && renderer.clear();
    ignoreObjects.forEach((be) => (be.visible = false));
    renderer.render(scene, camera);
    ignoreObjects.forEach((be) => (be.visible = true));
    renderer.setRenderTarget(Z);
  }

  useFrame(() => {
    beforeRender()
    mipMaper.update(renderTarget.texture, renderTargetMipMap, renderer)
  })


  return {
    matrix: reflectMatrixRef.current,
    renderTarget: renderTargetMipMap,
  }
}

export { useReflect }