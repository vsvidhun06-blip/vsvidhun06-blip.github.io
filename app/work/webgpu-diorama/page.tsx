import type { Metadata } from "next";
import { CaseBody, CaseHeader, CaseSection, KeyList, NextProject, Prose } from "@/components/case";
import DemoFrame from "@/components/demo-frame";
import { Evidence } from "@/components/ui";

export const metadata: Metadata = {
  title: "Winter cabin diorama in WebGPU",
  description: "A real-time WebGPU scene with Phong shading written in WGSL, an OBJ loader, a free camera and simple physics, from a group graphics coursework.",
  alternates: { canonical: "/work/webgpu-diorama/" },
};

const toc = [
  { id: "demo", label: "Live demo" },
  { id: "built", label: "What is in it" },
  { id: "shader", label: "The lighting" },
  { id: "scope", label: "Scope and credit" },
];

const phong = `// Ambient
let ambient = ka * ia;

// Diffuse
let lightDir = normalize(lightPosition - position);
let diff = max(dot(normal, lightDir), 0);
let diffuse = kd * id * diff;

// Specular
let viewDir = normalize(fsInput.viewPos.xyz - position);
let reflectDir = reflect(-lightDir, normal);
let spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
let specular = ks * is * spec;

// Full Phong light calculation
var output = colorTexture * vec4f(ambient + diffuse + specular, 1.0);`;

const fall = `const gravity = -9.8;
fallVelocity += gravity * deltaSeconds;
fallOffsetY  += fallVelocity * deltaSeconds;`;

export default function Page() {
  return (
    <article>
      <CaseHeader
        kicker="WebGPU diorama"
        title={
          <>
            A winter cabin, <em>lit by hand</em>
          </>
        }
        lede={<p>A small real-time scene on the WebGPU API: an OBJ cabin, Phong lighting written in WGSL, a free camera, a few physics toggles and snow drifting in the wind.</p>}
        meta={[
          { label: "Context", value: "MSc group coursework, 3D graphics" },
          { label: "Date", value: "Nov 2025" },
          { label: "Runs on", value: "Browsers with WebGPU" },
          { label: "Stack", value: "WebGPU, WGSL, JavaScript, wgpu-matrix" },
        ]}
        links={[{ label: "Open the demo", href: "/demos/winter-cabin/" }]}
      />
      <CaseBody toc={toc}>
        <CaseSection id="demo" n="01" title="Live demo" wide>
          <DemoFrame src="/demos/winter-cabin/" title="Winter cabin WebGPU diorama" />
          <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-[var(--fg-3)]">
            The 26 November 2025 build, unchanged apart from a back link, a controls hint and a notice for browsers
            without WebGPU. It only loads when you ask, so this page stays light.
          </p>
        </CaseSection>
        <CaseSection id="built" n="02" title="What is in it">
          <KeyList
            items={[
              { t: "OBJ loading", d: "A small parser reads positions, normals and texture coordinates from the OBJ files and builds vertex buffers for the pipeline." },
              { t: "Free camera", d: "WASD or arrow keys to move, pointer lock while the left button is held to look around, scroll to zoom." },
              { t: "Animations", d: "Freefall drops the cabin from above under constant gravity, Float bobs it on a sine wave, Shake jitters it, and it rotates continuously unless paused." },
              { t: "Snow", d: "A 2D canvas layer over the scene with drifting flakes and a wind term, behind a backdrop image." },
            ]}
          />
          <div className="mt-8">
            <p className="eyebrow mb-3">Freefall, per frame</p>
            <pre className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4 font-mono text-[12.5px] leading-relaxed text-[var(--fg-2)]">{fall}</pre>
          </div>
        </CaseSection>
        <CaseSection id="shader" n="03" title="The lighting">
          <Prose>
            <p>
              Lighting is computed per fragment. Ambient light is a constant floor; diffuse light scales with the angle
              between the surface normal and the light; specular highlights depend on how closely the reflected light
              lines up with the viewer, sharpened by a shininess exponent. The three terms modulate the sampled texture.
            </p>
          </Prose>
          <pre className="mt-8 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4 font-mono text-[12.5px] leading-relaxed text-[var(--fg-2)]">{phong}</pre>
          <div className="mt-3">
            <Evidence kind="tool">excerpt from WinterCabinFS.wgsl</Evidence>
          </div>
        </CaseSection>
        <CaseSection id="scope" n="04" title="Scope and credit">
          <Prose>
            <p>
              This was group coursework, and the scene is a modest one: a single model, one light, no shadows or
              post-processing. I include it because it is the one place I have written GPU pipeline code by hand, from
              buffer layouts and bind groups to the shader. The backdrop image is not my own work.
            </p>
          </Prose>
        </CaseSection>
      </CaseBody>
      <NextProject current="webgpu-diorama" />
    </article>
  );
}
