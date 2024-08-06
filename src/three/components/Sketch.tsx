import {
  Environment,
  OrbitControls,
  useCubeCamera,
  useEnvironment,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { flatModel, printModel } from "@utils/misc";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  Color,
  DoubleSide,
  LinearFilter,
  LinearMipMapLinearFilter,
  LinearSRGBColorSpace,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
  ShaderMaterial,
  Texture,
  Uniform,
  UnsignedByteType,
  Vector2,
} from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import vertexShader from "@/three/shaders/sketch/vertex.glsl";
import fragmentShader from "@/three/shaders/sketch/fragment.glsl";
import { useModifyCSM } from "@utils/tools";
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useControls } from "leva";
import { useGameStore, useInteractStore, useLoadedStore } from "@utils/Store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReflect } from "@utils/useReflect";
import floorVertex from "@/three/shaders/sketch/floorver.glsl";
import floorFrag from "@/three/shaders/sketch/floorfrag.glsl";

const Sketch3 = () => {
  const cargltf = useGLTF("/models/sm_car.gltf", false, true);
  const startRommgltf = useGLTF("/models/sm_startroom.raw.gltf", false, true);
  const gltf = useGLTF("/models/sm_speedup.gltf", false, true);
  const aoMap = useTexture("/textures/t_car_body_AO.raw.jpg");
  const lightMap = useTexture("/textures/t_startroom_light.raw.jpg");
  const startRoomAoMap = useTexture("/textures/t_startroom_ao.raw.jpg");
  const floorroughnessMap = useTexture("/textures/t_floor_roughness.webp");
  const floornormalMap = useTexture("/textures/t_floor_normal.webp");
  // const env = useEnvironment({ files: "/textures/t_env_light.hdr" });

  const touch = useInteractStore((state) => state.touch);

  const modelRef = useRef({
    wheel: [] as Mesh[],
    bodyMat: null as MeshStandardMaterial | null,
    floor: null as Mesh | null,
    lightMat: null as MeshStandardMaterial | null,
  });

  const params = useRef({
    speedFactor: 0,
    initColor: new Color("#fff"),
    speedupColor: new Color("#000"),
    floorColor: new Color("#fff"),
    floorNormalSpeed: 0,
    bloomIntensity: 1,
    bloomThreshold: 0.9,
    lightOpacity: 1,
    floorEnvIntensity: 0,
    wheelRoughness: 1,
    wheelEnvIntensity: 5,
  });

  /* 处理资源文件 */
  floorroughnessMap.colorSpace = LinearSRGBColorSpace;
  floorroughnessMap.wrapS = floorroughnessMap.wrapT = RepeatWrapping;
  floornormalMap.colorSpace = LinearSRGBColorSpace;
  floornormalMap.wrapS = floornormalMap.wrapT = RepeatWrapping;
  aoMap.flipY = false;
  aoMap.colorSpace = LinearSRGBColorSpace;
  aoMap.minFilter = NearestFilter;
  aoMap.magFilter = NearestFilter;
  aoMap.channel = 1;
  startRoomAoMap.flipY = false;
  startRoomAoMap.channel = 1;
  startRoomAoMap.flipY = false;
  startRoomAoMap.colorSpace = LinearSRGBColorSpace;
  lightMap.channel = 1;
  lightMap.flipY = false;
  lightMap.colorSpace = SRGBColorSpace;

  const controlDom = useInteractStore((state) => state.controlDom);
  const scene = useThree((state) => state.scene);
  const bloomRef = useRef<any>(null);
  const bodyColor = useGameStore((state) => state.bodyColor);

  useGSAP(
    () => {
      if (!modelRef.current.bodyMat) return;
      const par = {
        color: modelRef.current.bodyMat.color,
        targetColor: new Color(bodyColor),
      };
      // const neoColor = new Color(bodyColor);
      gsap.to(par.color, {
        duration: 0.35,
        ease: "power1.out",
        r: par.targetColor.r,
        g: par.targetColor.g,
        b: par.targetColor.b,
        onUpdate: () => {
          modelRef.current.bodyMat!.color.set(par.color);
        },
      });
    },
    { dependencies: [bodyColor] }
  );
  useGSAP(
    () => {
      const baseParam = params.current;
      const lightMat = modelRef.current.lightMat;
      const flooMat = modelRef.current.floor?.material as MeshPhysicalMaterial;
      const wheel = modelRef.current.wheel;
      gsap.killTweensOf(baseParam);
      gsap.killTweensOf(floorUniforms.uColor.value);
      if (touch) {
        const t1 = gsap.timeline();
        t1.to(floorUniforms.uColor.value, {
          duration: 1.5,
          ease: "power1.in",
          r: baseParam.speedupColor.r,
          g: baseParam.speedupColor.g,
          b: baseParam.speedupColor.b,
        });

        t1.to(
          baseParam,
          {
            duration: 1.5,
            ease: "power1.in",
            lightOpacity: 0,
            onUpdate: () => {
              lightMat && (lightMat.opacity = baseParam.lightOpacity);
            },
          },
          0
        );

        t1.to(
          baseParam,
          {
            duration: 1.5,
            ease: "power1.in",
            speedFactor: 1,
            floorEnvIntensity: 0.5,
            bloomIntensity: 2,
            bloomThreshold: 0.1,
            wheelRoughness: 0,
            wheelEnvIntensity: 20,
            floorNormalSpeed: 1,
            onUpdate: () => {
              uniforms.uSpeedFactor.value = baseParam.speedFactor;
              flooMat &&
                (flooMat.envMapIntensity = baseParam.floorEnvIntensity);
              wheel.forEach((item) => {
                const mat = item.material as MeshStandardMaterial;
                mat.roughness = baseParam.wheelRoughness;
                mat.envMapIntensity = baseParam.wheelEnvIntensity;
              });
              bloomRef.current.intensity = baseParam.bloomIntensity;
              bloomRef.current.luminanceThreshold = baseParam.bloomThreshold;
            },
          },
          1
        );
      } else {
        const t2 = gsap.timeline();
        t2.to(baseParam, {
          duration: 1.5,
          ease: "power1.in",
          speedFactor: 0,
          floorEnvIntensity: 0,
          bloomIntensity: 1,
          bloomThreshold: 1,
          wheelRoughness: 1,
          wheelEnvIntensity: 5,
          floorNormalSpeed: 0,
          onUpdate: () => {
            uniforms.uSpeedFactor.value = baseParam.speedFactor;
            flooMat && (flooMat.envMapIntensity = baseParam.floorEnvIntensity);
            wheel.forEach((item) => {
              const mat = item.material as MeshStandardMaterial;
              mat.roughness = baseParam.wheelRoughness;
              mat.envMapIntensity = baseParam.wheelEnvIntensity;
            });
            bloomRef.current.intensity = baseParam.bloomIntensity;
            bloomRef.current.luminanceThreshold = baseParam.bloomThreshold;
          },
        });
        t2.to(
          floorUniforms.uColor.value,
          {
            duration: 1.5,
            ease: "power1.in",
            r: baseParam.initColor.r,
            g: baseParam.initColor.g,
            b: baseParam.initColor.b,
          },
          "-=1"
        );

        t2.to(
          baseParam,
          {
            duration: 1.5,
            ease: "power1.in",
            lightOpacity: 1,
            onUpdate: () => {
              lightMat && (lightMat.opacity = baseParam.lightOpacity);
            },
          },
          "-=1"
        );
      }
    },
    { dependencies: [touch] }
  );

  const uniforms = useMemo(
    () => ({
      uTime: new Uniform(0),
      uSpeedFactor: new Uniform(0),
    }),
    []
  );

  const floorUniforms = useMemo(
    () => ({
      uColor: new Uniform(new Color("white")),
      uReflectMatrix: new Uniform(new Matrix4()),
      uReflectTexture: new Uniform(new Texture()),
      uReflectIntensity: new Uniform(15),
      uIntensity: new Uniform(1),
      uLevel: new Uniform(0),
      uResolution: new Uniform(new Vector2()),
      uTime: new Uniform(0),
    }),
    []
  );

  useControls("mimapLevel", {
    level: {
      min: 0,
      max: 10,
      value: 2.5,
      onChange: (value) => (floorUniforms.uLevel.value = value),
    },
    lightOpacity: {
      value: 1,
      min: 0,
      max: 1,
      onChange: (value) => {
        modelRef.current.lightMat!.opacity = value;
      },
    },
  });

  const handleModel = () => {
    const modelParts = flatModel(cargltf);
    const modelParts2 = flatModel(startRommgltf);
    printModel(modelParts);
    printModel(modelParts2);
    const body = modelParts[2] as THREE.Mesh;
    const bodyMat = body.material as THREE.MeshStandardMaterial;
    bodyMat.envMapIntensity = 5;
    bodyMat.color = new Color("#26d6e9");
    modelParts.forEach((item: THREE.Mesh) => {
      if (item.isMesh) {
        const mat = item.material as THREE.MeshStandardMaterial;
        mat.aoMap = aoMap;
      }
    });
    const wheel = modelParts[35] as THREE.Mesh;
    wheel.children.forEach((child) => {
      const mesh = child as Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.envMapIntensity = 5;
      modelRef.current.wheel.push(mesh);
    });

    const light = modelParts2[1] as THREE.Mesh;
    console.log("light", light);
    const lightMat = light.material as THREE.MeshPhysicalMaterial;
    lightMat.emissive = new Color("white");
    lightMat.toneMapped = false;
    lightMat.transparent = true;
    // lightMat.alphaTest = 0.01;
    light.material = new MeshBasicMaterial({
      color: 0xffffff,
      side: DoubleSide,
      transparent: true,
      alphaTest: 0.01,
    });

    const floor = modelParts2[2] as THREE.Mesh;
    const floorMat = floor.material as THREE.MeshPhysicalMaterial;
    floorMat.roughnessMap = floorroughnessMap;
    floorMat.normalMap = floornormalMap;
    floorMat.aoMap = startRoomAoMap;
    floorMat.lightMap = lightMap;
    floorMat.envMapIntensity = 0;

    const floorCsmMat = new CustomShaderMaterial({
      baseMaterial: floorMat,
      uniforms: floorUniforms,
      vertexShader: floorVertex,
      fragmentShader: floorFrag,
      silent: true,
    });

    floor.material = floorCsmMat;
    floorUniforms.uReflectTexture.value = renderTarget.texture;
    renderTarget.texture.minFilter = LinearFilter;
    renderTarget.texture.magFilter = LinearFilter;
    floorUniforms.uReflectMatrix.value = matrix;

    modelRef.current.bodyMat = bodyMat;
    modelRef.current.floor = floor;
    modelRef.current.lightMat = light.material as MeshStandardMaterial;
  };

  const mat = useMemo(
    () =>
      new CustomShaderMaterial({
        baseMaterial: ShaderMaterial,
        uniforms,
        vertexShader,
        fragmentShader,
        silent: true,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  useModifyCSM(gltf, mat);

  useLayoutEffect(() => {
    handleModel();
    floorUniforms.uResolution.value.set(
      renderTarget.width,
      renderTarget.height
    );
    scene.environment = fbo.texture;
  }, []);

  useEffect(() => {
    useLoadedStore.setState({ ready: true });
  }, []);

  /* generate envMap */
  const { fbo, camera } = useCubeCamera({ resolution: 512 });
  fbo.texture.type = UnsignedByteType;
  fbo.texture.generateMipmaps = false;
  fbo.texture.minFilter = NearestFilter;
  fbo.texture.magFilter = NearestFilter;

  /* The best reflection experience is the screen size. If it is stuck, please reduce the size. */
  const { matrix, renderTarget } = useReflect(modelRef.current.floor!, {
    resolution: [innerWidth, innerHeight],
    ignoreObjects: [modelRef.current.floor!, gltf.scene, startRommgltf.scene],
  });

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    floorUniforms.uTime.value += delta * params.current.floorNormalSpeed * 20;
    cargltf.scene.visible = false;
    camera.update(state.gl, scene);
    cargltf.scene.visible = true;
    modelRef.current.wheel.forEach((child) => {
      child.rotateZ(-delta * 30 * params.current.speedFactor);
    });
  });

  return (
    <>
      <OrbitControls domElement={controlDom} />
      <color attach="background" args={["#000"]} />
      {/* <ambientLight intensity={0.5} /> */}
      {/* <directionalLight position={[0, 10, 0]}></directionalLight> */}

      <primitive object={gltf.scene} />
      <primitive object={cargltf.scene} rotation-y={Math.PI} />
      <primitive object={startRommgltf.scene} />

      <EffectComposer
        disableNormalPass
        frameBufferType={UnsignedByteType}
        multisampling={2}
        enabled={true}
      >
        <Bloom
          luminanceThreshold={0.1}
          ref={bloomRef}
          blendFunction={BlendFunction.ADD}
          mipmapBlur
          radius={0.2}
          opacity={0.7}
        ></Bloom>
      </EffectComposer>
    </>
  );
};

export default Sketch3;
