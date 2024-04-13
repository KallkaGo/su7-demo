#include '/node_modules/lygia/lighting/fresnel.glsl
#include '../includes/packedTexture2DLOD.glsl
varying vec2 vUv;
varying vec4 vWorldPosition;

uniform vec3 uColor;
uniform mat4 uReflectMatrix;
uniform sampler2D uReflectTexture;
uniform float uReflectIntensity;
uniform float uIntensity;
uniform float uLevel;
uniform vec2 uResolution;
uniform float uTime;

void main() {

  /* normalMap */
  vec3 worldPos = vWorldPosition.xyz;
  worldPos.x -= uTime * 0.1;
  vec3 surfaceNormal = texture2D(normalMap, worldPos.xz).xyz * 2.0 - 1.0;
  surfaceNormal = surfaceNormal.rbg;
  surfaceNormal = normalize(surfaceNormal);

  vec3 viewDir = vViewPosition;
  float d = length(viewDir);
  viewDir = normalize(viewDir);

  // vec2 distortion = surfaceNormal.xz * (0.001 + 1.);
  vec2 distortion = surfaceNormal.xz * (0.001 + 1. / d);

  vec4 reflectPoint = uReflectMatrix * vWorldPosition;
  // 齐次转三维
  reflectPoint = reflectPoint / reflectPoint.w;
  vec2 uv = reflectPoint.xy + distortion * uIntensity;
  vec3 reflectionSample = packedTexture2DLOD(uReflectTexture, uv, uLevel, uResolution).xyz;
  // vec3 reflectionSample = texture2D(uReflectTexture,uv).xyz;
  reflectionSample *= uReflectIntensity;

  vec3 strength = fresnel(vec3(0.), vNormal, viewDir);
  vec3 col = uColor;
  col = mix(col, reflectionSample, strength);
  // col += reflectionSample;
  csm_DiffuseColor = vec4(col, 1.);
  // csm_DiffuseColor = vec4(reflectionSample, 1.);

}
